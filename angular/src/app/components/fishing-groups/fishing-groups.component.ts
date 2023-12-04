import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FishingGroup } from "src/app/models/fishing-group.model";
import { AuthenticationService } from "src/app/services/authentication.service";
import { ConnectionService } from "src/app/services/connection.service";
import { FishingApiService } from "src/app/services/fishing-api.service";

@Component({
  selector: "app-fishing-groups",
  templateUrl: "./fishing-groups.component.html",
  styleUrls: ["./fishing-groups.component.scss"],
})
export class FishingGroupsComponent implements OnInit {
  fishingGroups!: FishingGroup[];

  addFishingGroupBool = false;
  deleteFishingGroupBool = false;
  editFishingGroupBool = false;

  addUserBool = false;

  addFishingGroupForm!: FormGroup;
  deleteFishingGroupId = "";
  editFishingGroupForm!: FormGroup;

  newUser = "";

  addUserOptions = {
    icon: "fas fa-save",
    type: "default",
    onClick: () => {
      this.addUserToDB();
    },
  };

  constructor(
    private fishingApiservice: FishingApiService,
    private authenticationService: AuthenticationService,
    private connectionService: ConnectionService
  ) {
    this.addFishingGroup = this.addFishingGroup.bind(this);
    this.editFishingGroup = this.editFishingGroup.bind(this);
  }

  ngOnInit(): void {
    this.fishingApiservice.getFishingGroups().subscribe((res) => {
      this.fishingGroups = res;
    });
  }

  isConnected() {
    return this.connectionService.isConnected;
  }

  getNumberOfUsers(data: any) {
    const num = data?.data?.users?.length || 0;
    return num.toString() + (num > 1 ? " users" : " user");
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn();
  }

  canModifyFishingGroup(data: any) {
    const user = this.authenticationService.getCurrentUser();
    return user?.role === "admin" || user?.email === data.data.creator;
  }

  openAddFishingGroupPopup() {
    this.addFishingGroupForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      description: new FormControl(null),
    });
    this.addFishingGroupBool = true;
  }

  closeAddFishingGroupPopup() {
    this.addFishingGroupBool = false;
  }

  addFishingGroup() {
    this.fishingApiservice
      .addFishingGroup(this.addFishingGroupForm.value)
      .subscribe((res) => {
        this.fishingApiservice.getFishingGroups().subscribe((res) => {
          this.fishingGroups = res;
          this.closeAddFishingGroupPopup();
        });
      });
  }

  openDeleteDialog(data: any) {
    this.deleteFishingGroupId = data.data._id;
    this.deleteFishingGroupBool = true;
  }

  closeDeletePopup() {
    this.deleteFishingGroupBool = false;
  }

  deleteFishingGroup() {
    this.fishingApiservice
      .deleteFishingGroup(this.deleteFishingGroupId)
      .subscribe((res) => {
        this.fishingApiservice.getFishingGroups().subscribe((res) => {
          this.fishingGroups = res;
          this.closeDeletePopup();
        });
      });
  }

  openEditFishingGroupDialog(data: any) {
    this.editFishingGroupForm = new FormGroup({
      name: new FormControl(data.data.name, Validators.required),
      description: new FormControl(data.data.description),
      _id: new FormControl(data.data._id),
      users: new FormControl(data.data.users),
      creator: new FormControl(data.data.creator),
    });
    this.editFishingGroupBool = true;
  }

  closeEditFishingGroupDialog() {
    this.fishingApiservice.getFishingGroups().subscribe((res) => {
      this.fishingGroups = res;
    });
    this.editFishingGroupBool = false;
  }

  editFishingGroup() {
    this.fishingApiservice
      .editFishingGroup(this.editFishingGroupForm.value)
      .subscribe((res) => {
        this.closeEditFishingGroupDialog();
      });
  }

  addUser() {
    this.addUserBool = true;
  }

  removeUser(user: string) {
    this.fishingApiservice
      .deleteUser(this.editFishingGroupForm.get("_id")?.value, user)
      .subscribe((res) => {
        const newUsers = this.editFishingGroupForm.get("users")
          ?.value as string[];
        newUsers.splice(newUsers.findIndex((i) => i === user));
        this.editFishingGroupForm.patchValue({
          users: newUsers,
        });
        this.addUserBool = false;
        this.newUser = "";
      });
  }

  userChange(e: any) {
    this.newUser = e.value;
  }

  addUserToDB() {
    this.fishingApiservice
      .addUser(this.editFishingGroupForm.get("_id")?.value, this.newUser)
      .subscribe((res) => {
        this.editFishingGroupForm.patchValue({
          users: [
            ...(this.editFishingGroupForm.get("users")?.value || []),
            this.newUser,
          ],
        });
        this.addUserBool = false;
        this.newUser = "";
      });
  }

  notAuthor(user: any) {
    return user !== this.editFishingGroupForm.get("creator")?.value;
  }
}
