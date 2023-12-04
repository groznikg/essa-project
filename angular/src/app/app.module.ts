import { HttpClientModule } from "@angular/common/http";
import { NgModule, isDevMode } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { ServiceWorkerModule } from "@angular/service-worker";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
  DxButtonModule,
  DxChartModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
} from "devextreme-angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DbComponent } from "./components/db/db.component";
import { FishingGroupsComponent } from "./components/fishing-groups/fishing-groups.component";
import { HeaderComponent } from "./components/header/header.component";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { CommentsInfoComponent } from "./components/trip/comments-info/comments-info.component";
import { FishInfoComponent } from "./components/trip/fish-info/fish-info.component";
import { MapComponent } from "./components/trip/map/map.component";
import { TripInfoComponent } from "./components/trip/trip-info/trip-info.component";
import { TripComponent } from "./components/trip/trip.component";
import { TripsAroundComponent } from "./components/trip/trips-around/trips-around.component";
import { AddTripComponent } from "./components/trips/add-trip/add-trip.component";
import { TripsComponent } from "./components/trips/trips.component";
import { AddKgPipe } from "./pipes/add-kg.pipe";
import { MostRecentFirstPipe } from "./pipes/most-recent-first.pipe";
import { SortByWeightPipe } from "./pipes/sort-by-weight.pipe";
import { AuthenticationService } from "./services/authentication.service";
import { ConnectionService } from "./services/connection.service";
import { FishingApiService } from "./services/fishing-api.service";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    TripsComponent,
    FishingGroupsComponent,
    TripComponent,
    LoginComponent,
    AddTripComponent,
    MapComponent,
    MostRecentFirstPipe,
    RegistrationComponent,
    AddKgPipe,
    SortByWeightPipe,
    TripInfoComponent,
    FishInfoComponent,
    CommentsInfoComponent,
    TripsAroundComponent,
    DbComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    DxToolbarModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxPopupModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    LeafletModule,
    DxDropDownBoxModule,
    DxChartModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  providers: [FishingApiService, AuthenticationService, ConnectionService],
  bootstrap: [AppComponent],
})
export class AppModule {}
