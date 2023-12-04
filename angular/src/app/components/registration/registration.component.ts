import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";

@Component({
  selector: "app-register",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"],
})
export class RegistrationComponent implements OnInit {
  protected formError!: string;
  registrationForm!: FormGroup;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.registrationForm = new FormGroup({
      email: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    });
  }

  isConnected() {
    return this.connectionService.isConnected;
  }

  register() {
    this.formError = "";
    if (
      !this.registrationForm.value.name ||
      !this.registrationForm.value.email ||
      !this.registrationForm.value.password
    )
      this.formError = "All fields are required, please try again.";
    else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        this.registrationForm.value.email
      )
    )
      this.formError = "Please enter a valid e-mail address.";
    else if (this.registrationForm.value.password.length < 3)
      this.formError = "Password must be at least 3 characters long.";
    else this.doRegister();
  }

  private doRegister() {
    this.authenticationService
      .register(this.registrationForm.value)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.formError = error.toString();
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.router.navigateByUrl("/");
      });
  }
}
