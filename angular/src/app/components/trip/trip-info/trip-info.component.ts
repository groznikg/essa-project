import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Trip } from "src/app/models/trip.model";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-trip-info",
  templateUrl: "./trip-info.component.html",
  styleUrls: ["./trip-info.component.scss"],
})
export class TripInfoComponent {
  @Input() trip!: Trip;

  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();

  form!: FormGroup;
  editTripBool = false;
  deleteDialog = false;

  constructor(
    private fishingApiService: FishingApiService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {
    this.saveTrip = this.saveTrip.bind(this);
  }
  isConnected() {
    return this.connectionService.isConnected;
  }

  editTrip() {
    this.form = new FormGroup({
      name: new FormControl(this.trip?.name, Validators.required),
      time: new FormControl(this.trip?.time, Validators.required),
      type: new FormControl(this.trip?.type, Validators.required),
      description: new FormControl(this.trip?.description),
      coordinates1: new FormControl(this.trip?.coordinates[0]),
      coordinates2: new FormControl(this.trip?.coordinates[1]),
    });
    this.editTripBool = true;
  }

  closedPopup() {
    this.editTripBool = false;
  }

  saveTrip(e: any) {
    this.fishingApiService
      .editTrip({ ...this.form.getRawValue(), _id: this.trip?._id })
      .subscribe(() => {
        this.reloadData.emit(true);
        this.closedPopup();
      });
  }

  closeDeleteDialog() {
    this.deleteDialog = false;
  }

  openDeleteDialog() {
    this.deleteDialog = true;
  }

  deleteTrip() {
    if (this.trip) {
      this.fishingApiService.deleteTrip(this.trip?._id).subscribe((result) => {
        this.router.navigateByUrl("/trips");
        this.closeDeleteDialog();
      });
    }
  }

  canModifyTrip() {
    const user = this.authenticationService.getCurrentUser();
    return user?.role === "admin" || this.trip.user === user?.email;
  }
}
