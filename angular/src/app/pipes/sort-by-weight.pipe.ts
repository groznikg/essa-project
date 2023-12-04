import { Pipe, PipeTransform } from "@angular/core";
import { Fish } from "../models/fish.model";

@Pipe({
  name: "sortByWeight",
})
export class SortByWeightPipe implements PipeTransform {
  transform(fish: Fish[] | undefined): Fish[] | undefined {
    if (fish && fish.length > 0) {
      fish = fish.sort((a, b) => {
        let order = 0;
        if (b.weight && a.weight) {
          if (b.weight > a.weight) order = 1;
          else if (b.weight < a.weight) order = -1;
        }
        return order;
      });
    }
    return fish;
  }
}
