import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { User } from "../models/user.model";
import { FishingApiService } from "./fishing-api.service";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  apiUrl = "http://localhost:3000/api";

  constructor(private fishingApiService: FishingApiService) {}

  public login(user: User): Observable<AuthResponse> {
    return this.fishingApiService.login(user).pipe(
      tap((authResponse: AuthResponse) => {
        this.saveToken(authResponse.token);
      })
    );
  }

  public register(user: User): Observable<AuthResponse> {
    return this.fishingApiService.register(user).pipe(
      tap((authResponse: AuthResponse) => {
        this.saveToken(authResponse.token);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem("token");
  }

  public getToken(): string {
    return localStorage.getItem("token") || "";
  }

  public saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  private b64Utf8(input: string): string {
    return decodeURIComponent(
      Array.prototype.map
        .call(window.atob(input), (character: string) => {
          return "%" + ("00" + character.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }

  public isLoggedIn(): boolean {
    const token: string | null = this.getToken();
    if (token) {
      const payload = JSON.parse(this.b64Utf8(token.split(".")[1]));
      return payload.exp > Date.now() / 1000;
    } else return false;
  }

  public getCurrentUser(): User | null {
    let user!: User;
    if (this.isLoggedIn()) {
      let token: string | null = this.getToken();
      if (token) {
        let { email, name, role } = JSON.parse(
          this.b64Utf8(token.split(".")[1])
        );
        user = { email, name, role };
      }
    }
    return user;
  }
}
export class AuthResponse {
  token!: string;
}
