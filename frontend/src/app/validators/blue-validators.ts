import { FormControl, ValidationErrors } from "@angular/forms";

export class BlueValidators {

    //whitespace validation
    static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null{

        //check if the string only have whitespace
        if((control.value != null) && (control.value.trim().length === 0)){
            //invalid
            return {'notOnlyWhiteSpace': true};
        }else{
            //valid
            return null;

        }

    }
}
