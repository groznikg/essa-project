import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-add-trip",
  templateUrl: "./add-trip.component.html",
  styleUrls: ["./add-trip.component.scss"],
})
export class AddTripComponent implements OnInit {
  @Output() closed = new EventEmitter<boolean>();

  form!: FormGroup;

  constructor(private fishingApiService: FishingApiService) {
    this.addTrip = this.addTrip.bind(this);
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      time: new FormControl(Date.now(), Validators.required),
      type: new FormControl("", Validators.required),
      description: new FormControl(null),
      coordinates1: new FormControl(null),
      coordinates2: new FormControl(null),
    });
  }

  closedPopup(): void {
    this.closed.emit(true);
  }

  addTrip(): void {
    this.fishingApiService.addTrip(this.form.getRawValue()).subscribe((res) => {
      this.closedPopup();
    });
  }
}
