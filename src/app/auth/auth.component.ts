import { Component, ComponentFactoryResolver, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthResponseData, AuthService } from "./auth.service";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { AlertComponent } from "../shared/alert/alert.component";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild('placeholder', { read: ViewContainerRef }) alertHost: ViewContainerRef;

  private closeSub: Subscription;
    ngOnDestroy(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  private showErrorAlert(message: string) {

    const alertCmpFactory = this.alertHost.createComponent(AlertComponent);

    alertCmpFactory.instance.message = message;
    this.closeSub = alertCmpFactory.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      this.alertHost.clear();
    })

  }

  constructor(private authService: AuthService,
    private router: Router,
  ) { }


  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;
    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    authObs.subscribe({
      next: resData => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(['/recipes']);
      },
      error: errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.showErrorAlert(errorMessage);
        this.isLoading = false;
      }
    });

    form.reset();
  }

  onHandleError() {
    this.error = null;
  }



}
