import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { LevelData, ProgramData, UserData, UnitData, CodeType } from 'src/app/models/database/DatabaseData';
import { AngularFireStorage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
/**
 * Service that Manages interactions between client database
 */
export class FirestoreDatabaseService {

  //constants for the names of database collections
  /**
   * Firestore Collection id for User Data
   */
  private USER_DATA = "User_Data";
  /**
   * Firestore Collection id for Program Data
   */
  private CODE_DATA = "Code_Data";
  /**
   * Firestore Collection id for Level Data
   */
  private LEVEL_DATA = "Level_Data";

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  /**
   * Sends a request to database for the specified document in the collection
   * returns the observable for the request
   * @param collection The collection the database is checking
   * @param documentname the document id that is being requested
   */
  private queryDocument(collection: string, documentname: string): Observable<any> {
    return this.db.collection(collection).doc(documentname).get();
  }

  /**
   * Sends a request to database for the deletion of the specified document
   * returns a promise with the success of the request
   * @param collection the collection the database is checking
   * @param documentname the document id that is being request
   */
  private deleteDocument(collection: string, documentname: string): Promise<void> {
    return this.db.collection(collection).doc(documentname).delete();
  }

  /**
   * Sends a request to database for updating the data of the specified document.
   * Creates a new document of the specified name/id if it doesnt already exist
   * Returns a promise with the success of the request.
   * @param collection the collection of the document in the database is updating
   * @param documentname the document id that is being update
   * @param data the data to update with
   */
  private updateDocument(collection: string, documentname: string, data): Promise<void> {
    return this.db.collection(collection).doc(documentname).set(data);
  }

  /**
   * Checks if a document exists, returns a promise on the result
   * @param collection the collection the documents we are checking
   * @param documentname the document id to look for
   * @returns promise with type boolean
   */
  private doesDocumentExist(collection: string, documentname: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.collection(collection).doc(documentname).get().subscribe(result => {
        resolve(result.exists);
      });
    });
  }

  /**
   * Sends a request to database for getting all documents within a specified collection.
   * returns an observable for the request
   * @param collection the collection of documents we are getting
   * @returns observable with status and data of the data
   */
  private queryDocumentsFromCollection(collection: string): Observable<any> {
    return this.db.collection(collection).get();
  }

  //getters

  /**
   * function to get user data from the database. Must include a listener function(Userdata) for response
   * @param uid the user id you are getting data for
   * @param listenerFunction the function(ProgramData) that receives the request data
   */
  public getUserData(uid: string, listenerFunction) {
    this.queryDocument(this.USER_DATA, uid).subscribe(result => {
      if (result.exists) {
        var data = result.data();
        var ud: UserData = {
          Username: data.Username,
          CompletedLevels: data.CompletedLevels,
          Programs: data.OwnedCodes,
          Level: data.Level,
          Description: data.description
        }
        listenerFunction(ud);
      } else {
        listenerFunction(null);
      }
    })
  }

  /**
   * function to get the data for a program from the database Must include a listener function(ProgramData) for response
   * @param cid the program id you are getting data for
   * @param listenerFunction the function(Programdata) that receives the request data
   */
  public getProgramData(cid: string, listenerFunction) {
    this.queryDocument(this.CODE_DATA, cid).subscribe(result => {
      var data = result.data();

      //gets array of units
      var units = [];
      for (var x = 0; x < data.units.length; x++) {
        var u: UnitData = {
          TroopType: data.units[x].type, CodeBlocks: data.units[x].blocks,
          CodeType: CodeType[data.units[x].ctype as string], CodeFile: data.units[x].codeFile,
          location: data.units[x].location
        };

        units.push(u);
      }


      var pd: ProgramData = {
        Name: data.name,
        Verified: data.verified,
        Units: units
      }
      listenerFunction(pd);
    });
  }

  /**
   * function to get the data for a level from the database Must include a listener function(LevelData) for response
   * @param lid the program id you are getting data for
   * @param listenerFunction the function(LevelData) that receives the request data
   */
  public getLevelData(lid: string, listenerFunction) {
    this.queryDocument(this.LEVEL_DATA, lid).subscribe(result => {
      var data = result.data();

      var ld: LevelData = {
        ProgramId: data.Code
      }

      listenerFunction(ld);
    });
  }

  /**
   * function to get the data for a program in a level from the database Must include a listener function(ProgramData) for response
   * @param lid the program id you are getting data for
   * @param listenerFunction the function(ProgramData) that receives the request data
   */
  public getLevelProgram(lid: string, listenerFunction) {
    var self = this;
    this.getLevelData(lid, function (data) {
      self.getProgramData(data.ProgramId.toString(), listenerFunction);
    })
  }

  /**
   * function to retrieve the user's hand typed code and converts it to a worker. Must include a listener function(ProgramData) for response
   * @param storageRef the path in storage to the user's code
   * @param fileName the name you wish to save the file as
   * @param listenerFunction the function(Worker) that receives the request data
   */
  public getUserCodeFromStorage(storageRef, fileName, listenerFunction) {

    let ref = this.storage.ref(storageRef);
    ref.getDownloadURL().subscribe(
      res => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.onload = function (event) {
          let code = xhr.response;
          let file = new File([code], fileName, {
            type: "text/javascript",
          });
          let url = window.URL.createObjectURL(file);
          listenerFunction(new Worker(url));
        };
        xhr.open('GET', res);
        xhr.send();
      },
      error => {
        console.log(error);
      }
    )

  }

  /**
   * Gets all level data document snapshots from the levels collection
   * @param callback function to call on request complete. parameter will give a QuerySnapshot
   */
  public getAllLevels(callback) {
    this.queryDocumentsFromCollection(this.LEVEL_DATA).subscribe(result => {
      callback(result);
    });
  }

  /**
   * Checks if a program document exists in database, returns a callback with result
   * @param pid the program id to get
   * @param callback the callback function on request complete
   */
  public doesProgramExist(pid: string, callback) {
    this.doesDocumentExist(this.CODE_DATA, pid).then((result) => {
      callback(result);
    });
  }

  //setters
  /**
   * Function that sets the data in the user collection database based on a UserData object
   * Returns the promise of the response
   * @param uid the id of the user you are trying to change
   * @param ud the UserData object to place into database
   */
  public setUserData(uid: string, ud: UserData): Promise<void> {
    return this.updateDocument(this.USER_DATA, uid, {
      Username: ud.Username,
      CompletedLevels: ud.CompletedLevels,
      OwnedCodes: ud.Programs,
      Level: ud.Level,
      description: ud.Description
    })
  }

  /**
   * Function that sets the data in the program collection database based on a ProgramData object
   * Returns the promise of the response
   * @param pid the id of the program you are trying to change
   * @param pd the ProgramData object to place into database
   */
  public setProgramData(pid: string, pd: ProgramData): Promise<void> {

    var dbunit = [];
    for (var x = 0; x < pd.Units.length; x++) {
      dbunit.push({
        blocks: pd.Units[x].CodeBlocks, location: pd.Units[x].location, type: pd.Units[x].TroopType,
        ctype: CodeType[pd.Units[x].CodeType], codeFile: pd.Units[x].CodeFile
      });
    }

    return this.updateDocument(this.CODE_DATA, pid, {
      name: pd.Name,
      verified: pd.Verified,
      units: dbunit
    });
  }

  /**
   *
   * Stores a user's javascript code at the specified url if that url does not already contain code.
   * Note: this assumes the file does not already exist. To ensure it doesn't I include the current time in the url
   * for simplicity.
   * @param url: the url you wish to save your code at
   * @param file: the file containing the code
   */
  public storeCodeAtLocation(url: string, file: File){

    this.storage.upload(url, file);

  }

  //deleters
  /**
   * Deletes program data from database
   * @param pid the program id to delete
   */
  public deleteProgramData(pid: string): Promise<void> {
    return this.deleteDocument(this.CODE_DATA, pid);
  }

}
