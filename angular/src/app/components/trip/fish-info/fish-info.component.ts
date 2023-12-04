import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Fish } from "src/app/models/fish.model";
import { Trip } from "src/app/models/trip.model";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-fish-info",
  templateUrl: "./fish-info.component.html",
  styleUrls: ["./fish-info.component.scss"],
})
export class FishInfoComponent {
  @Input() trip!: Trip;

  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();

  addFishForm!: FormGroup;
  editFishForm!: FormGroup;
  deleteFishId: string = "";

  addFishBool = false;
  editFishBool = false;
  deleteFishBool = false;

  constructor(
    private fishingApiService: FishingApiService,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {
    this.addFish = this.addFish.bind(this);
    this.saveFish = this.saveFish.bind(this);
  }

  isConnected() {
    return this.connectionService.isConnected;
  }

  openAddFishPopup() {
    this.addFishForm = new FormGroup({
      species: new FormControl("", Validators.required),
      weight: new FormControl(),
      description: new FormControl(),
    });
    this.addFishBool = true;
  }

  closeAddFishPopup() {
    this.addFishBool = false;
  }

  addFish() {
    const tripId = this.trip?._id || "";
    this.fishingApiService
      .addFish(tripId, this.addFishForm.value)
      .subscribe((res) => {
        this.reloadData.emit(true);
        this.closeAddFishPopup();
      });
  }

  openEditFishPopup(fish: Fish) {
    this.editFishForm = new FormGroup({
      _id: new FormControl(fish._id),
      species: new FormControl(fish.species, Validators.required),
      weight: new FormControl(fish.weight),
      description: new FormControl(fish.description),
    });
    this.editFishBool = true;
  }

  closeEditFishPopup() {
    this.editFishBool = false;
  }

  saveFish() {
    const tripId = this.trip?._id || "";
    this.fishingApiService
      .editFish(tripId, this.editFishForm.value)
      .subscribe((res) => {
        this.reloadData.emit(true);
        this.closeEditFishPopup();
      });
  }

  openDeleteFishPopup(fishId: string) {
    this.deleteFishBool = true;
    this.deleteFishId = fishId;
  }

  closeDeleteFishDialog() {
    this.deleteFishBool = false;
  }

  deleteFish() {
    const tripId = this.trip?._id || "";
    this.fishingApiService
      .deleteFish(tripId, this.deleteFishId)
      .subscribe(() => {
        this.reloadData.emit(true);
        this.closeDeleteFishDialog();
      });
  }

  canModifyFish() {
    const user = this.authenticationService.getCurrentUser();
    return user?.role === "admin" || this.trip.user === user?.email;
  }
}
