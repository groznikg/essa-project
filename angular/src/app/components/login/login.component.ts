import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  formError!: string;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    });
  }

  isConnected() {
    return this.connectionService.isConnected;
  }

  login() {
    this.formError = "";
    if (!this.loginForm.value.email || !this.loginForm.value.password)
      this.formError = "All fields are required, please try again.";
    else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        this.loginForm.value.email
      )
    )
      this.formError = "Please enter a valid e-mail address.";
    else if (this.loginForm.value.password.length < 3)
      this.formError = "Password must be at least 3 characters long.";
    else this.doLogin();
  }

  private doLogin(): void {
    this.authenticationService
      .login(this.loginForm.value)
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
