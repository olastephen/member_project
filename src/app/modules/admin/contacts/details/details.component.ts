import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ContactsService } from 'app/modules/admin/contacts/contacts.service';
import { Contact } from 'app/modules/admin/contacts/contacts.types';
import { ContactsListComponent } from 'app/modules/admin/contacts/list/list.component';

@Component({
    selector: 'contacts-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        MatIconModule,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        NgClass,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        TextFieldModule,
        FuseFindByKeyPipe,
        DatePipe
    ],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    editMode: boolean = false;
    contact: Contact;
    contactForm: UntypedFormGroup;
    contacts: Contact[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsListComponent: ContactsListComponent,
        private _contactsService: ContactsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this._contactsListComponent.matDrawer.open();
    
        this.contactForm = this._formBuilder.group({
            id: [''],
            avatar: [null],
            name: ['', [Validators.required]],
            marital_status: [''],
            gender: [''],
            age_group: [''],
            date: [''],
            invited_by: [''],
            first_time_visitor: [false],
            returning_visitor: [false],
            new_to_area: [false],
            visitation: this._formBuilder.group({
                day_of_visit: [''],
                time_of_visit: [''],
            }),
            communication_tool: this._formBuilder.group({
                telephone_call: [false],
                sms_whatsapp: [false],
            }),
            emails: this._formBuilder.array([]),
            phoneNumbers: this._formBuilder.array([]),
            job: this._formBuilder.group({
                title: [''],
                company: [''],
            }),
            birthday: [''],
            address: [''],
            notes: [''],
        });
    
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                this.contacts = contacts;
                this._changeDetectorRef.markForCheck();
            });
    
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: Contact) => {
                this._contactsListComponent.matDrawer.open();
                this.contact = contact;
    
                // Clear existing form arrays
                (this.contactForm.get('emails') as UntypedFormArray).clear();
                (this.contactForm.get('phoneNumbers') as UntypedFormArray).clear();
                this.contactForm.patchValue(contact);
    
                // Patch emails if present and ensure it's an array
                const emailFormGroups = [];
                if (Array.isArray(contact.emails) && contact.emails.length > 0) {
                    contact.emails.forEach((email) => {
                        emailFormGroups.push(
                            this._formBuilder.group({
                                email: [email.email],
                                label: [email.label],
                            })
                        );
                    });
                } else {
                    emailFormGroups.push(
                        this._formBuilder.group({
                            email: [''],
                            label: [''],
                        })
                    );
                }
                emailFormGroups.forEach((emailFormGroup) => {
                    (this.contactForm.get('emails') as UntypedFormArray).push(emailFormGroup);
                });
    
                // Patch phoneNumbers if present and ensure it's an array
                const phoneNumbersFormGroups = [];
                if (Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0) {
                    contact.phoneNumbers.forEach((phoneNumber) => {
                        phoneNumbersFormGroups.push(
                            this._formBuilder.group({
                                phoneNumber: [phoneNumber.phoneNumber],
                                label: [phoneNumber.label],
                            })
                        );
                    });
                } else {
                    phoneNumbersFormGroups.push(
                        this._formBuilder.group({
                            phoneNumber: [''],
                            label: [''],
                        })
                    );
                }
                phoneNumbersFormGroups.forEach((phoneNumbersFormGroup) => {
                    (this.contactForm.get('phoneNumbers') as UntypedFormArray).push(phoneNumbersFormGroup);
                });
    
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });
    }
    
    

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._contactsListComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    updateContact(): void {
        if (this.contactForm.invalid) {
            console.log('Form is invalid');
            return;
        }
    
        const contact = this.contactForm.getRawValue();
        console.log('Raw Form Value:', contact);
    
        // Filter out empty emails and phone numbers
        contact.emails = contact.emails.filter(email => email.email);
        contact.phoneNumbers = contact.phoneNumbers.filter(phoneNumber => phoneNumber.phoneNumber);
    
        console.log('Processed Contact:', contact);
    
        this._contactsService.updateContact(contact.id, contact).subscribe({
            next: () => {
                console.log('Contact updated successfully');
                this.toggleEditMode(false);
            },
            error: (err) => {
                console.error('Error updating contact:', err);
            }
        });
    }
    
    
    
    deleteContact(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete contact',
            message: 'Are you sure you want to delete this contact? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const id = this.contact.id;
                const currentContactIndex = this.contacts.findIndex(item => item.id === id);
                const nextContactIndex = currentContactIndex + (currentContactIndex === this.contacts.length - 1 ? -1 : 1);
                const nextContactId = this.contacts.length === 1 && this.contacts[0].id === id ? null : this.contacts[nextContactIndex].id;

                this._contactsService.deleteContact(id).subscribe(() => {
                    if (nextContactId) {
                        this._router.navigate(['../', nextContactId], { relativeTo: this._activatedRoute });
                    } else {
                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    }
                    this.toggleEditMode(false);
                });
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    uploadAvatar(fileList: FileList): void {
        if (!fileList.length) {
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(fileList[0]);
        reader.onload = (): void => {
            this.contactForm.get('avatar').setValue(reader.result);
            this._changeDetectorRef.markForCheck();
        };
    }

    removeAvatar(): void {
        this.contactForm.get('avatar').setValue(null);
        this._avatarFileInput.nativeElement.value = null;
    }

    addEmailField(): void {
        const emailFormGroup = this._formBuilder.group({
            email: [''],
            label: [''],
        });
        (this.contactForm.get('emails') as UntypedFormArray).push(emailFormGroup);
        this._changeDetectorRef.markForCheck();
    }

    addPhoneNumberField(): void {
        const phoneNumberFormGroup = this._formBuilder.group({
            phoneNumber: [''],
            label: [''],
        });
        (this.contactForm.get('phoneNumbers') as UntypedFormArray).push(phoneNumberFormGroup);
        this._changeDetectorRef.markForCheck();
    }

    removeEmailField(index: number): void {
        const emailFormArray = this.contactForm.get('emails') as UntypedFormArray;
        emailFormArray.removeAt(index);
        this._changeDetectorRef.markForCheck();
    }

    removePhoneNumberField(index: number): void {
        const phoneNumbersFormArray = this.contactForm.get('phoneNumbers') as UntypedFormArray;
        phoneNumbersFormArray.removeAt(index);
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
