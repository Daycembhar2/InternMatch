import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CRUDService } from '../service/crud.service';

export interface PricingPlan {
  id: number;
  name: string;
  price: number | string;
  period: string;
  recommended: boolean;
  features: string[];
  maxOffres: number;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent {

  paymentHandler: any = null;
  private planKey: string = 'selectedPlan';

  pricingPlans: PricingPlan[] = [
    {
      id: 1,
      name: 'Trial',
      price: 'Free',
      period: 'month',
      recommended: false,
      maxOffres: 5,
      features: [
        '5 offres publiées',
        '1 offre mise en avant',
        '2 candidats suivis',
        'Support limité'
      ]
    },
    {
      id: 2,
      name: 'Extended',
      price: 180,
      period: 'year',
      recommended: true,
      maxOffres: 999,
      features: [
        '999 offres publiées',
        '30 offres mises en avant',
        'Inviter des candidats',
        'Envoyer des messages',
        'Imprimer les profils',
        'Voir les infos candidats',
        'Support prioritaire'
      ]
    },
    {
      id: 3,
      name: 'Basic',
      price: 90,
      period: 'year',
      recommended: false,
      maxOffres: 100,
      features: [
        '100 offres publiées',
        '5 offres mises en avant',
        '2 candidats suivis',
        'Envoyer des messages',
        'Support basique'
      ]
    }
  ];

  constructor(private router: Router, private crudService: CRUDService) {
    const user = this.crudService.userDetails();
    if (user?.id) {
      this.planKey = `selectedPlan_${user.id}`;
    }
    this.invokeStripe();
  }

  isNumericPrice(plan: PricingPlan): boolean {
    return typeof plan.price === 'number';
  }

  selectPlan(plan: PricingPlan): void {
    if (plan.price === 'Free') {
      // Plan gratuit → accès direct
      localStorage.setItem(this.planKey, JSON.stringify(plan));
      
      Swal.fire({
        icon: 'success',
        title: 'Plan Trial activé !',
        text: 'Vous pouvez maintenant publier vos offres.',
        confirmButtonColor: '#7c3aed'
      }).then(() => {
        this.router.navigate(['/entreprise/home']);
      });
      return;
    }

    // Plan payant → Stripe
    this.makePayment(plan);
  }

  makePayment(plan: PricingPlan): void {
    if (!this.paymentHandler) {
      Swal.fire({
        icon: 'error',
        title: 'Stripe non chargé',
        text: 'Veuillez patienter et réessayer.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    const amountInCents = (plan.price as number) * 100;

    this.paymentHandler.open({
      name: 'InternMatch',
      description: `Plan ${plan.name} — ${plan.price} DT/${plan.period}`,
      currency: 'usd',   // Stripe test ne supporte pas TND, utilise USD
      amount: amountInCents,
      token: (stripeToken: any) => {
        console.log('Token Stripe reçu :', stripeToken);
        this.onPaymentSuccess(plan);
      }
    });
  }

  onPaymentSuccess(plan: PricingPlan): void {
    // Sauvegarder le plan en localStorage
    localStorage.setItem(this.planKey, JSON.stringify(plan));
    localStorage.setItem('planPaidAt', new Date().toISOString());

    // Générer la facture
    this.showInvoice(plan);
  }

  showInvoice(plan: PricingPlan): void {
    const date = new Date().toLocaleDateString('fr-TN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    Swal.fire({
      icon: 'success',
      title: '✅ Paiement confirmé !',
      html: `
        <div style="text-align:left; font-family: sans-serif; font-size: 14px;">
          <div style="border-bottom: 2px solid #7c3aed; padding-bottom: 10px; margin-bottom: 16px;">
            <strong style="font-size:18px; color:#7c3aed;">🧾 Facture InternMatch</strong>
          </div>
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color:#555;">Plan :</td>
              <td style="padding: 6px 0; font-weight:bold;">${plan.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color:#555;">Durée :</td>
              <td style="padding: 6px 0;">${plan.period === 'year' ? 'Annuel' : 'Mensuel'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color:#555;">Date :</td>
              <td style="padding: 6px 0;">${date}</td>
            </tr>
            <tr style="border-top: 1px solid #eee;">
              <td style="padding: 10px 0; color:#555; font-weight:bold;">Total payé :</td>
              <td style="padding: 10px 0; font-weight:bold; color:#7c3aed; font-size:16px;">
                ${plan.price} DT
              </td>
            </tr>
          </table>
          <p style="margin-top:12px; color:#888; font-size:12px;">
            Merci pour votre confiance. Une confirmation a été envoyée à votre adresse email.
          </p>
        </div>
      `,
      confirmButtonText: '🚀 Publier mon offre',
      confirmButtonColor: '#7c3aed',
      showCancelButton: true,
      cancelButtonText: 'Fermer'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/entreprise/home']);
      }
    });
  }

  invokeStripe(): void {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement('script');
      script.id = 'stripe-script';
      script.type = 'text/javascript';
      script.src = 'https://checkout.stripe.com/checkout.js';
      script.onload = () => {
        this.paymentHandler = (<any>window).StripeCheckout.configure({
          key: 'pk_test_51ORfw8CGCz5RXlZeoe3XDe37HmmqpZVdoHzeTdv6BwUbc2FN7TshEC3TQJeGrDQPE1oBRYJHeXUPDPqoUvwRZsAb00g0HXBiwp',
          locale: 'auto'
        });
      };
      window.document.body.appendChild(script);
    }
  }
}