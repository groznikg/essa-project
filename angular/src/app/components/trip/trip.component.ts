import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Trip } from "src/app/models/trip.model";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-trip",
  templateUrl: "./trip.component.html",
  styleUrls: ["./trip.component.scss"],
})
export class TripComponent implements OnInit {
  trip: Trip | null = null;
  showMap = false;
  refresh = false;
  noCoordinates = true;

  constructor(
    private route: ActivatedRoute,
    private fishingApiService: FishingApiService,
    private connectionService: ConnectionService
  ) {}

  isConnected() {
    return this.connectionService.isConnected;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((res) => {
      this.refresh = false;
      this.fishingApiService
        .getTrip(res.get("tripId")?.toString() || "")
        .subscribe((trip) => {
          this.trip = trip;
          this.noCoordinates = true;
          if (this.trip?.coordinates?.length === 2) {
            this.noCoordinates = false;
          }
          this.showMap = true;
          this.refresh = true;
        });
    });
  }

  reloadData(e: any) {
    this.fishingApiService.getTrip(this.trip?._id || "").subscribe((trip) => {
      this.showMap = false;
      this.trip = trip;
      this.noCoordinates = true;
      if (this.trip?.coordinates?.length === 2) {
        this.noCoordinates = false;
      }
      setTimeout(() => {
        this.showMap = true;
      });
    });
  }
}
