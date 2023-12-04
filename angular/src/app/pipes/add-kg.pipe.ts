import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "addKg",
})
export class AddKgPipe implements PipeTransform {
  transform(weight: number): string {
    return weight + "kg";
  }
}
