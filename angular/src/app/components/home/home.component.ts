import { Component, OnInit } from "@angular/core";
import { LineChartDataItem } from "src/app/models/line-chart.model";
import { FishingApiService } from "src/app/services/fishing-api.service";
import { CountsByMonth } from "../../models/count-by-months.model";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  dataSource!: LineChartDataItem[];
  constructor(private fishingApiService: FishingApiService) {}

  ngOnInit(): void {
    this.fishingApiService.getTrips().subscribe((trips) => {
      const countsByMonth: CountsByMonth = trips.reduce((acc, trip) => {
        const date = new Date(trip.time);
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[yearMonth] = (acc[yearMonth] || 0) + 1;
        return acc;
      }, {} as CountsByMonth);

      const lineChartData: LineChartDataItem[] = Object.keys(countsByMonth)
        .map((yearMonth) => ({
          date: yearMonth,
          count: countsByMonth[yearMonth],
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      this.dataSource = lineChartData;
    });
  }
}
