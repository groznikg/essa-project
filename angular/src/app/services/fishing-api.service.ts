import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, retry, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { Comment } from "../models/comment.model";
import { Fish } from "../models/fish.model";
import { FishingGroup } from "../models/fishing-group.model";
import { Trip } from "../models/trip.model";
import { User } from "../models/user.model";
import { AuthResponse } from "./authentication.service";

@Injectable({
  providedIn: "root",
})
export class FishingApiService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTrips() {
    return this.http.get<Trip[]>(this.apiUrl + "/trips");
  }

  getTripsWithPaging(skip: number, take: number) {
    let params = new HttpParams().set("skip", skip).set("take", take);
    return this.http.get<{ trips: Trip[]; totalPages: number }>(
      this.apiUrl + "/trips-paginate",
      { params }
    );
  }

  getTripsAroundAddress(address: string) {
    let params = new HttpParams()
      .set("address", address)
      .set("distance", 10)
      .set("nResults", 100);
    return this.http.get<Trip[]>(this.apiUrl + "/trips/address", { params });
  }

  getTripsAround(lng: number, lat: number) {
    let params = new HttpParams()
      .set("lng", lng)
      .set("lat", lat)
      .set("distance", 10)
      .set("nResults", 100);
    return this.http.get<Trip[]>(this.apiUrl + "/trips/distance", { params });
  }

  getTrip(tripId: string) {
    return this.http.get<Trip>(this.apiUrl + "/trips/" + tripId);
  }

  getFishingGroups() {
    return this.http.get<FishingGroup[]>(this.apiUrl + "/fishing-group");
  }

  addTrip(trip: Trip) {
    const url: string = `${this.apiUrl}/trips`;
    let body = new HttpParams()
      .set("name", trip.name)
      .set("time", trip.time.toString())
      .set("type", trip.type);
    if (trip.description) {
      body = body.append("description", trip.description);
    }
    if (trip.coordinates1?.toString() && trip.coordinates2?.toString()) {
      body = body.append(
        "coordinates",
        `${trip.coordinates1}, ${trip.coordinates2}`
      );
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .post<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  editTrip(trip: Trip) {
    const url: string = `${this.apiUrl}/trips/${trip._id}`;
    let body = new HttpParams();
    if (trip.name) {
      body = body.append("name", trip.name);
    }
    if (trip.time) {
      body = body.append("time", trip.time.toString());
    }
    if (trip.type) {
      body = body.append("type", trip.type);
    }
    if (trip.description) {
      body = body.append("description", trip.description);
    }
    if (trip.coordinates1?.toString() && trip.coordinates2?.toString()) {
      body = body.append(
        "coordinates",
        `${trip.coordinates1}, ${trip.coordinates2}`
      );
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .put<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  deleteTrip(tripId: string) {
    const url: string = `${this.apiUrl}/trips/${tripId}`;
    let headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${localStorage.getItem("token")}`
    );
    return this.http
      .delete(url, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  addFish(tripId: string, fish: Fish) {
    const url: string = `${this.apiUrl}/trips/${tripId}/fish`;
    let body = new HttpParams().set("species", fish.species);
    if (fish.weight) {
      body = body.append("weight", fish.weight);
    }
    if (fish.description) {
      body = body.append("description", fish.description);
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .post<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  editFish(tripId: string, fish: Fish) {
    const url: string = `${this.apiUrl}/trips/${tripId}/fish/${fish._id}`;
    let body = new HttpParams();
    if (fish.species) {
      body = body.append("species", fish.species);
    }
    if (fish.weight) {
      body = body.append("weight", fish.weight);
    }
    if (fish.description) {
      body = body.append("description", fish.description);
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .put<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  deleteFish(tripId: string, fishId: string) {
    const url: string = `${this.apiUrl}/trips/${tripId}/fish/${fishId}`;
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .delete<Trip>(url, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  addComment(tripId: string, comment: Comment) {
    const url: string = `${this.apiUrl}/trips/${tripId}/comments`;
    let body = new HttpParams().set("comment", comment.comment);
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .post<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  deleteComment(tripId: string, commentId: string) {
    const url: string = `${this.apiUrl}/trips/${tripId}/comments/${commentId}`;
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .delete<Trip>(url, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  addFishingGroup(fishingGroup: FishingGroup) {
    const url: string = `${this.apiUrl}/fishing-group`;
    let body = new HttpParams().set("name", fishingGroup.name);
    if (fishingGroup.description) {
      body = body.append("description", fishingGroup.description);
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .post<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  deleteFishingGroup(fishingGroupId: string) {
    const url: string = `${this.apiUrl}/fishing-group/${fishingGroupId}`;
    let headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${localStorage.getItem("token")}`
    );
    return this.http
      .delete(url, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  addUser(fishingGroupId: string, user: string) {
    const url: string = `${this.apiUrl}/fishing-group/${fishingGroupId}/users`;
    let body = new HttpParams().set("users", user);
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .put<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  deleteUser(fishingGroupId: string, user: string) {
    const url: string = `${this.apiUrl}/fishing-group/${fishingGroupId}/users-remove`;
    let body = new HttpParams().set("users", user);
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .put<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  editFishingGroup(fishingGroup: FishingGroup) {
    const url: string = `${this.apiUrl}/fishing-group/${fishingGroup._id}`;
    let body = new HttpParams();
    if (fishingGroup.name) {
      body = body.append("name", fishingGroup.name);
    }
    if (fishingGroup.description) {
      body = body.append("description", fishingGroup.description);
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Authorization", `Bearer ${localStorage.getItem("token")}`);
    return this.http
      .put<Trip>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  fillDB() {
    return this.http.post<{ message: string }>(this.apiUrl + "/db", {});
  }

  resetDB() {
    return this.http.delete<{ message: string }>(this.apiUrl + "/db");
  }

  public login(user: User): Observable<AuthResponse> {
    return this.makeAuthApiCall("login", user);
  }

  public register(user: User): Observable<AuthResponse> {
    return this.makeAuthApiCall("register", user);
  }

  private makeAuthApiCall(
    urlPath: string,
    user: User
  ): Observable<AuthResponse> {
    const url: string = `${this.apiUrl}/${urlPath}`;
    let body = new HttpParams().set("email", user.email).set("name", user.name);
    if (user.password) body = body.set("password", user.password);
    let headers = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    return this.http
      .post<AuthResponse>(url, body, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}
