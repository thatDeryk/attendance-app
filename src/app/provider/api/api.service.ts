/* tslint:disable:indent */
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  Action,
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentChangeAction,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists,
} from '@angular/fire/compat/firestore';
import { DocumentData, serverTimestamp } from 'firebase/firestore';

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    public afs: AngularFirestore,
    public auth: AngularFireAuth,
    private http: HttpClient
  ) {}

  /// Firebase Server Timestamp

/*  get token(): any {
    return firebase
      .auth()
      .currentUser.getIdToken()
      .then(token => {
        return token;
      });
  }*/

 /* async httpHeader() {
    const token = await this.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Firebase-ID-Token': token,
        Authorization: 'Bearer ' + token
      })
    };
    return httpOptions;
  }*/

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get timestamp(): any {
    return serverTimestamp();
  }

  public createId(): string {
    return this.afs.createId();
  }
  // getAuthUid(): string {
  //   //  const user = await (this.storage.getItem('driver'));
  //   //  if(user){
  //   //    return user.uid;
  //   //  }
  //   return (await this.auth.currentUser).uid;
  // }

  /// **************
  /// Get a Reference
  /// **************

  post(url: string, param: any, header): Observable<any> {
    return this.http.post(url, param, header);
  }
  get(url) {
    return this.http.get(url);
  }

  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }

  /// **************
  /// Get Data
  /// **************

  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }

  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref)
      .snapshotChanges()
      .pipe(
        map(doc => {
          const data: any = doc.payload.data() as T;
          const id = doc.payload.id;
          return { id, ...data };
        })
      );
  }

  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .pipe(
        map(docs => docs.map(a => a.payload.doc.data()) as T[])
      );
  }

  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<any[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .pipe(
        map((actions: DocumentChangeAction<T>[]) => actions.map((a: DocumentChangeAction<T>) => {
          // eslint-disable-next-line @typescript-eslint/ban-types
          const data: Object = a.payload.doc.data() as T;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  /// **************
  /// Write Data
  /// **************

  inspectCol(ref: CollectionPredicate<any>): void {
    const tick = new Date().getTime();
    this.col(ref)
      .snapshotChanges()
      .pipe(
        take(1),
        tap((c: DocumentChangeAction<any>[]) => {
          const tock = new Date().getTime() - tick;
          console.log(`Loaded Collection in ${tock}ms`, c);
        })
      )
      .subscribe();
  }

  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp;
    return this.doc(ref).set(
      {
        ...data,
        updatedAt: timestamp,
        createdAt: timestamp
      },
      { merge: true }
    );
  }

  update<T>(ref: DocPredicate<T>, data: any) {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    });
  }

  delete<T>(ref: DocPredicate<T>) {
    return this.doc(ref).delete();
  }

  add<T>(
    ref: CollectionPredicate<T>,
    data
  ): Promise<DocumentData> {
    const timestamp = this.timestamp;
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    });
  }

  /// If doc exists update, otherwise set
  upsert<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    const doc = this.doc(ref)
      .snapshotChanges()
      .pipe(take(1))
      .toPromise();
    return doc.then(
      (
        snap: Action<DocumentSnapshotDoesNotExist | DocumentSnapshotExists<T>>
      ) =>
         snap.payload.exists
          ? this.update(ref, data)
          : this.set(ref, data)
    );
  }

  docExists(path: string) {
    console.log(path);
    return this.afs
      .doc(path)
      .valueChanges()
      .pipe(take(1))
      .toPromise();
  }
}
