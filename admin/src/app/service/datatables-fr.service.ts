import { Injectable } from '@angular/core';

declare var $: any;

@Injectable({ providedIn: 'root' })
export class DatatablesFrService {

  private langFR = {
    processing:     'Traitement en cours...',
    search:         'Rechercher :',
    lengthMenu:     'Afficher _MENU_ éléments',
    info:           'Affichage de _START_ à _END_ sur _TOTAL_ éléments',
    infoEmpty:      'Affichage de 0 à 0 sur 0 élément',
    infoFiltered:   '(filtré à partir de _MAX_ éléments au total)',
    loadingRecords: 'Chargement en cours...',
    zeroRecords:    'Aucun élément à afficher',
    emptyTable:     'Aucune donnée disponible dans le tableau',
    paginate: {
      first:    'Premier',
      previous: 'Précédent',
      next:     'Suivant',
      last:     'Dernier'
    },
    aria: {
      sortAscending:  ': activer pour trier par ordre croissant',
      sortDescending: ': activer pour trier par ordre décroissant'
    }
  };

  init(tableId: string, extraOptions: any = {}): void {
    setTimeout(() => {
      if (!$ || !$.fn || !$.fn.DataTable) {
        console.warn('DataTables jQuery non disponible');
        return;
      }
      if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().destroy();
      }
      $(`#${tableId}`).DataTable({
        language: this.langFR,
        ...extraOptions
      });
    }, 600);
  }
}