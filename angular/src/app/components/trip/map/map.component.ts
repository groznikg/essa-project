import { Component, Input, OnInit } from "@angular/core";
import * as Leaflet from "leaflet";
import { Trip } from "src/app/models/trip.model";

Leaflet.Icon.Default.imagePath = "assets/";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit {
  @Input() trip!: Trip | null;

  // Seznam markerjev imamo na voljo v primeru, ko jih želimo posodabljat, odstranjevat z mape itd.
  markers: Leaflet.Marker[] = [];

  // Ustvarimo objekt mapa ter dodamo osnovne lastnosti mapi
  map!: Leaflet.Map;
  options: any;

  ngOnInit(): void {
    this.options = {
      layers: [
        Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
      ],
      zoom: 14,
      center: {
        lat: this.trip?.coordinates[0] || 0,
        lng: this.trip?.coordinates[1] || 0,
      },
    };
  }

  dodajMarker(lastnosti: any): void {
    const marker = Leaflet.marker(lastnosti.pozicija);
    this.markers.push(marker);
    marker.addTo(this.map);
    this.map.panTo(lastnosti.pozicija);
    this.markers.push(marker);
  }

  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.dodajMarker({
      pozicija: {
        lat: this.trip?.coordinates[0] || 0,
        lng: this.trip?.coordinates[1] || 0,
      },
    });
  }
}
