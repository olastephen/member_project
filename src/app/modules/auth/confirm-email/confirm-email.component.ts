import { NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector     : 'auth-confirm-email',
    templateUrl  : './confirm-email.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
})
export class AuthConfirmEmailComponent implements OnInit
{
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    confirmationForm: UntypedFormGroup;
    showAlert: boolean = false;
    isLoading: boolean = false;
    token: string;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the confirmation token from the route
        this.token = this._activatedRoute.snapshot.queryParamMap.get('token') || '';

        // Create the form
        this.confirmationForm = this._formBuilder.group({
            token: [this.token, Validators.required],
        });

        // If there's no token, show an error
        if (!this.token) {
            this.alert = {
                type: 'error',
                message: 'Confirmation token is missing.',
            };
            this.showAlert = true;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Confirm email
     */
    confirmEmail(): void
    {
        // Return if the form is invalid
        if (this.confirmationForm.invalid)
        {
            return;
        }

        // Hide the alert
        this.showAlert = false;

        // Set loading to true
        this.isLoading = true;

        // Send the request to the server
        this._authService.confirmEmail(this.confirmationForm.get('token').value)
            .pipe(
                finalize(() =>
                {
                    // Set loading to false
                    this.isLoading = false;

                    // Show the alert
                    this.showAlert = true;
                }),
            )
            .subscribe(
                (response) =>
                {
                    // Set the alert
                    this.alert = {
                        type   : 'success',
                        message: 'Your email has been confirmed. You can now log in.',
                    };
                },
                (response) =>
                {
                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Invalid or expired token, please try again.',
                    };
                },
            );
    }
}
