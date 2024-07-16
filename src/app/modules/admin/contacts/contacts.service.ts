import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Contact } from 'app/modules/admin/contacts/contacts.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactsService {
    // Private
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(null);
    private apiUrl = 'https://ebapi.dayotech.org/contacts.php';

    constructor(private _httpClient: HttpClient) { }

    // Accessors
    get contact$(): Observable<Contact> {
        return this._contact.asObservable();
    }

    get contacts$(): Observable<Contact[]> {
        return this._contacts.asObservable();
    }

    // Public methods
    getContacts(): Observable<Contact[]> {
        return this._httpClient.get<Contact[]>(`${this.apiUrl}?action=all`).pipe(
            tap((contacts) => {
                this._contacts.next(contacts);
            }),
        );
    }

    searchContacts(query: string): Observable<Contact[]> {
        return this._httpClient.get<Contact[]>(`${this.apiUrl}?action=search&query=${query}`, {
            params: { query },
        }).pipe(
            tap((contacts) => {
                this._contacts.next(contacts);
            }),
        );
    }

    getContactById(id: string): Observable<Contact> {
        return this._contacts.pipe(
            take(1),
            switchMap((contacts) => {
                // Check if contacts are loaded
                if (!contacts) {
                    // If contacts are not loaded, load them first
                    return this.getContacts().pipe(
                        switchMap((loadedContacts) => {
                            const contact = loadedContacts.find(item => item.id.toString() === id) || null;
                            this._contact.next(contact);
                            if (!contact) {
                                console.error(`Could not find contact with id of ${id} after loading contacts.`);
                                return throwError(() => new Error('Could not found contact with id of ' + id + '!'));
                            }
                            return of(contact);
                        })
                    );
                } else {
                    // If contacts are already loaded, find the contact by ID
                    const contact = contacts.find(item => item.id.toString() === id) || null;
                    this._contact.next(contact);
                    if (!contact) {
                        console.error(`Could not find contact with id of ${id} in loaded contacts.`);
                        return throwError(() => new Error('Could not found contact with id of ' + id + '!'));
                    }
                    return of(contact);
                }
            })
        );
    }    
    

    createContact(): Observable<Contact> {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Contact>(`${this.apiUrl}?action=contact`, {}).pipe(
                map((newContact) => {
                    this._contacts.next([newContact, ...contacts]);
                    return newContact;
                }),
            )),
        );
    }

    updateContact(id: string, contact: Contact): Observable<Contact> {
        // Log the contact data before sending
        console.log('Updating contact with data:', { id, ...contact });
    
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts =>
                this._httpClient.patch<Contact>(`${this.apiUrl}?action=contact`, { id, ...contact }).pipe(
                    map((updatedContact) => {
                        const index = contacts.findIndex(item => item.id === id);
                        if (index !== -1) {
                            contacts[index] = updatedContact;
                            this._contacts.next(contacts);
                        }
                        console.log('Updated contact from server:', updatedContact);
                        return updatedContact;
                    }),
                    switchMap(updatedContact => this.contact$.pipe(
                        take(1),
                        filter(item => item && item.id === id),
                        tap(() => {
                            this._contact.next(updatedContact);
                            console.log('Updated contact in state:', updatedContact);
                        }),
                        map(() => updatedContact)
                    )),
                ),
            ),
        );
    }
    
    

    deleteContact(id: string): Observable<boolean> {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.delete(`${this.apiUrl}?action=contact&id=${id}`, { params: { id } }).pipe(
                map((isDeleted: boolean) => {
                    const index = contacts.findIndex(item => item.id === id);
                    contacts.splice(index, 1);
                    this._contacts.next(contacts);
                    return isDeleted;
                }),
            )),
        );
    }

    uploadAvatar(id: string, avatar: File): Observable<Contact> {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('avatar', avatar);

        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Contact>(`${this.apiUrl}?action=avatar`, formData).pipe(
                map((updatedContact) => {
                    const index = contacts.findIndex(item => item.id === id);
                    contacts[index] = updatedContact;
                    this._contacts.next(contacts);
                    return updatedContact;
                }),
                switchMap(updatedContact => this.contact$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        this._contact.next(updatedContact);
                        return updatedContact;
                    }),
                )),
            )),
        );
    }
}
