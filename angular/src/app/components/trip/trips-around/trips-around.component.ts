import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, tap } from "rxjs";
import { Trip } from "src/app/models/trip.model";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-trips-around",
  templateUrl: "./trips-around.component.html",
  styleUrls: ["./trips-around.component.scss"],
})
export class TripsAroundComponent implements OnInit {
  @Input() trip!: Trip;

  tripsAround: Trip[] = [];

  constructor(
    private fishingApiService: FishingApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fishingApiService
      .getTripsAround(this.trip.coordinates[0], this.trip.coordinates[1])
      .pipe(
        tap((res) => {
          this.tripsAround = res;
        }),
        catchError((e) => {
          return (this.tripsAround = []);
        })
      )
      .subscribe((res) => {});
  }

  goToTrip(id: string) {
    this.router.navigate(["trips", id]);
  }
}
