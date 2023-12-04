import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { DxTextBoxComponent } from "devextreme-angular";

import { Trip } from "src/app/models/trip.model";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-trips",
  templateUrl: "./trips.component.html",
  styleUrls: ["./trips.component.scss"],
})
export class TripsComponent implements OnInit {
  @ViewChild(DxTextBoxComponent) textBox!: DxTextBoxComponent;

  trips: Trip[] = [];
  addTripBool: boolean = false;
  deleteDialog = false;
  deleteTripId: string = "";
  address: string = "";

  take = 10;
  totalPages = 1;
  currentPage = 0;

  searchButton = {
    icon: "fas fa-search",
    type: "default",
    onClick: () => {
      this.address = this.textBox.instance.option("value") || "";
      this.applyAddressFilter();
    },
  };

  constructor(
    private fishingApiService: FishingApiService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.getAllTrips();
  }

  isConnected() {
    return this.connectionService.isConnected;
  }

  getAllTrips() {
    this.fishingApiService
      .getTripsWithPaging(this.currentPage * this.take, this.take)
      .subscribe((res) => {
        this.trips = res.trips;
        this.totalPages = res.totalPages;
      });
  }

  prevPage() {
    this.currentPage -= 1;
    this.getAllTrips();
  }

  nextPage() {
    this.currentPage += 1;
    this.getAllTrips();
  }

  openTrip(data: { data: Trip }) {
    this.router.navigate(["trips", data.data._id]);
  }

  addTrip() {
    this.addTripBool = true;
  }

  closeAddTrip() {
    this.addTripBool = false;
    this.getAllTrips();
  }

  closedPopup() {
    this.deleteDialog = false;
    this.deleteTripId = "";
  }

  openDeleteDialog(data: { data: Trip }) {
    this.deleteTripId = data.data._id;
    this.deleteDialog = true;
  }

  deleteTrip() {
    this.fishingApiService.deleteTrip(this.deleteTripId).subscribe((result) => {
      this.getAllTrips();
    });
    this.closedPopup();
  }

  applyAddressFilter() {
    this.fishingApiService
      .getTripsAroundAddress(this.address)
      .subscribe((result) => {
        this.trips = result;
      });
  }

  addressChange(e: any) {
    if (e.value === "") {
      this.getAllTrips();
    }
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn();
  }

  canDeleteTrip(data: { data: Trip }) {
    const user = this.authenticationService.getCurrentUser();
    return user?.role === "admin" || data.data.user === user?.email;
  }
}
