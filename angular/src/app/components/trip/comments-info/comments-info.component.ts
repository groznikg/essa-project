import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Comment } from "src/app/models/comment.model";
import { Trip } from "src/app/models/trip.model";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-comments-info",
  templateUrl: "./comments-info.component.html",
  styleUrls: ["./comments-info.component.scss"],
})
export class CommentsInfoComponent {
  @Input() trip!: Trip;

  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();

  addCommentForm!: FormGroup;
  deleteCommentId: string = "";

  addCommentBool = false;
  deleteCommentBool = false;

  constructor(
    private fishingApiService: FishingApiService,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {
    this.addComment = this.addComment.bind(this);
  }

  isConnected() {
    return this.connectionService.isConnected;
  }

  openAddCommentPopup() {
    this.addCommentForm = new FormGroup({
      comment: new FormControl("", Validators.required),
    });
    this.addCommentBool = true;
  }

  closeAddCommentPopup() {
    this.addCommentBool = false;
  }

  addComment() {
    const tripId = this.trip?._id || "";
    this.fishingApiService
      .addComment(tripId, this.addCommentForm.value)
      .subscribe((res) => {
        this.reloadData.emit(true);
        this.closeAddCommentPopup();
      });
  }

  openDeleteCommentPopup(commentId: string) {
    this.deleteCommentId = commentId;
    this.deleteCommentBool = true;
  }

  closeDeleteCommentPopup() {
    this.deleteCommentBool = false;
  }

  deleteComment() {
    const tripId = this.trip?._id || "";
    this.fishingApiService
      .deleteComment(tripId, this.deleteCommentId)
      .subscribe(() => {
        this.reloadData.emit(true);
        this.closeDeleteCommentPopup();
      });
  }

  canModifyComment(comment: Comment) {
    const user = this.authenticationService.getCurrentUser();
    return user?.role === "admin" || comment.author === user?.email;
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn();
  }
}
