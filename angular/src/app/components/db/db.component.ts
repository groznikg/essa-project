import { Component } from "@angular/core";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-db",
  templateUrl: "./db.component.html",
  styleUrls: ["./db.component.scss"],
})
export class DbComponent {
  constructor(
    private fishingApiService: FishingApiService,
    private connectionService: ConnectionService
  ) {}

  isConnected() {
    return this.connectionService.isConnected;
  }

  fillDB() {
    this.fishingApiService.fillDB().subscribe((res) => {
      console.log(res);
    });
  }

  resetDB() {
    this.fishingApiService.resetDB().subscribe((res) => {
      console.log(res);
    });
  }
}
