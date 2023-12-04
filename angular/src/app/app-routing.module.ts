import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DbComponent } from "./components/db/db.component";
import { FishingGroupsComponent } from "./components/fishing-groups/fishing-groups.component";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { RegistrationComponent } from "./components/registration/registration.component";
import { TripComponent } from "./components/trip/trip.component";
import { TripsComponent } from "./components/trips/trips.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "trips",
    component: TripsComponent,
  },
  { path: "trips/:tripId", component: TripComponent },
  {
    path: "fishing-groups",
    component: FishingGroupsComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegistrationComponent,
  },
  {
    path: "db",
    component: DbComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule {}
