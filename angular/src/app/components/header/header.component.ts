import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "src/app/models/user.model";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  user!: User | null;
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {}

  isConnected() {
    return this.connectionService.isConnected;
  }

  homeClick() {
    this.router.navigateByUrl("");
  }

  tripsClick() {
    this.router.navigateByUrl("trips");
  }

  fishingGroupsClick() {
    this.router.navigateByUrl("fishing-groups");
  }

  loginClick() {
    this.router.navigateByUrl("login");
  }

  dbClick() {
    this.router.navigateByUrl("db");
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  getUser() {
    return this.authenticationService.getCurrentUser();
  }
}
