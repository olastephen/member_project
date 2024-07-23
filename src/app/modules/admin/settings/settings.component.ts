import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from './settings.service';
import { User, SocialAccount } from './settings.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';

// Import necessary Angular Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule, MatDrawerToggleResult, MatDrawer } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSidenavModule,
        MatTooltipModule,
        MatDialogModule
    ]
})
export class SettingsComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    
    settingsForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _settingsService: SettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog
    ) { }

    get socialAccounts(): FormArray {
        return this.settingsForm.get('social_accounts') as FormArray;
    }

    get loginLogs(): FormArray {
        return this.settingsForm.get('login_logs') as FormArray;
    }

    get unlockSessions(): FormArray {
        return this.settingsForm.get('unlock_sessions') as FormArray;
    }

    get sessions(): FormArray {
        return this.settingsForm.get('sessions') as FormArray;
    }

    ngOnInit(): void {
        this.settingsForm = this._formBuilder.group({
            id: [''],
            avatar: [null],
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            company: [''],
            two_factor_enabled: [false],
            privacy_settings: this._formBuilder.group({
                setting1: [false],
                setting2: [false]
            }),
            newPassword: [''],
            oldPassword: [''],
            social_accounts: this._formBuilder.array([]),
            login_logs: this._formBuilder.array([]),
            unlock_sessions: this._formBuilder.array([]),
            sessions: this._formBuilder.array([])
        });

        // Load user data
        const userId = this._route.snapshot.paramMap.get('id');
        if (userId) {
            this._settingsService.getUserById(userId).subscribe((user: User) => {
                this.settingsForm.patchValue(user);
                this._changeDetectorRef.markForCheck();
            });

            this._settingsService.getSocialAccounts(userId).subscribe((accounts: SocialAccount[]) => {
                const socialAccountsFormArray = this.settingsForm.get('social_accounts') as FormArray;
                accounts.forEach(account => socialAccountsFormArray.push(this._formBuilder.group(account)));
                this._changeDetectorRef.markForCheck();
            });

            this._settingsService.getLoginLogs(userId).subscribe(logs => {
                const loginLogsFormArray = this.settingsForm.get('login_logs') as FormArray;
                logs.forEach(log => loginLogsFormArray.push(this._formBuilder.group(log)));
                this._changeDetectorRef.markForCheck();
            });

            this._settingsService.getUnlockSessions(userId).subscribe(sessions => {
                const unlockSessionsFormArray = this.settingsForm.get('unlock_sessions') as FormArray;
                sessions.forEach(session => unlockSessionsFormArray.push(this._formBuilder.group(session)));
                this._changeDetectorRef.markForCheck();
            });

            this._settingsService.getSessions(userId).subscribe(sessions => {
                const sessionsFormArray = this.settingsForm.get('sessions') as FormArray;
                sessions.forEach(session => sessionsFormArray.push(this._formBuilder.group(session)));
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    updateProfile(): void {
        const user = this.settingsForm.value;
        this._settingsService.updateProfile(user).subscribe(() => {
            // Handle success
        });
    }

    resetPassword(): void {
        const userId = this.settingsForm.get('id').value;
        const oldPassword = this.settingsForm.get('oldPassword').value;
        const newPassword = this.settingsForm.get('newPassword').value;

        this._settingsService.resetPassword(userId, oldPassword, newPassword).subscribe(() => {
            // Handle success
        });
    }

    changeEmail(): void {
        const userId = this.settingsForm.get('id').value;
        const newEmail = this.settingsForm.get('email').value;

        this._settingsService.changeEmail(userId, newEmail).subscribe(() => {
            // Handle success
        });
    }

    toggleTwoFactor(): void {
        const userId = this.settingsForm.get('id').value;
        const enabled = this.settingsForm.get('two_factor_enabled').value;

        this._settingsService.toggleTwoFactor(userId, enabled).subscribe(() => {
            // Handle success
        });
    }

    updatePrivacySettings(): void {
        const userId = this.settingsForm.get('id').value;
        const privacySettings = this.settingsForm.get('privacy_settings').value;

        this._settingsService.updatePrivacySettings(userId, privacySettings).subscribe(() => {
            // Handle success
        });
    }

    revokeSession(sessionId: string): void {
        const userId = this.settingsForm.get('id').value;

        this._settingsService.revokeSession(userId, sessionId).subscribe(() => {
            // Handle success
        });
    }

    linkSocialAccount(): void {
        const userId = this.settingsForm.get('id').value;
        const provider = this.settingsForm.get('provider').value;
        const email = this.settingsForm.get('email').value;

        this._settingsService.linkSocialAccount(userId, provider, email).subscribe((account: SocialAccount) => {
            const socialAccounts = this.settingsForm.get('social_accounts') as FormArray;
            socialAccounts.push(this._formBuilder.group(account));
        });
    }

    unlinkSocialAccount(accountId: string): void {
        const userId = this.settingsForm.get('id').value;

        this._settingsService.unlinkSocialAccount(userId, accountId).subscribe(() => {
            const socialAccounts = this.settingsForm.get('social_accounts') as FormArray;
            const index = socialAccounts.controls.findIndex(account => account.get('id').value === accountId);
            socialAccounts.removeAt(index);
        });
    }

    deleteAccount(): void {
        const userId = this.settingsForm.get('id').value;

        this._settingsService.deleteAccount(userId).subscribe(() => {
            // Handle success
        });
    }

    uploadAvatar(fileList: FileList): void {
        if (!fileList.length) {
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(fileList[0]);
        reader.onload = (): void => {
            this.settingsForm.get('avatar').setValue(reader.result);
            this._changeDetectorRef.markForCheck();
        };
    }

    removeAvatar(): void {
        this.settingsForm.get('avatar').setValue(null);
        this._avatarFileInput.nativeElement.value = null;
    }

    addSocialAccountField(): void {
        const socialAccountFormGroup = this._formBuilder.group({
            provider: [''],
            email: [''],
        });
        (this.settingsForm.get('social_accounts') as FormArray).push(socialAccountFormGroup);
        this._changeDetectorRef.markForCheck();
    }

    removeSocialAccountField(index: number): void {
        const socialAccountFormArray = this.settingsForm.get('social_accounts') as FormArray;
        socialAccountFormArray.removeAt(index);
        this._changeDetectorRef.markForCheck();
    }

    confirmDeleteAccount(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete contact',
            message: 'Are you sure you want to delete this account? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });
        
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.deleteAccount();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
