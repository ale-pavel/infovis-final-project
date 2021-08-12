# infovis-final-project
Progetto finale per l'esame di [Visualizzazione delle Informazioni](http://www.dia.uniroma3.it/~infovis/) di Roma Tre. Ulteriori informazioni sono disponibili su [Moodle](https://ingegneria.el.uniroma3.it/mod/page/view.php?id=10701), progetto #15.


## Obiettivi
L'obiettivo è esplorare il grafo della [saga islandese Hrafnkels](https://en.wikipedia.org/wiki/Hrafnkels_saga). In particolare si vuole riuscire a comprendere quali siano le relazioni tra i personaggi, definite dalle azioni che li riguardano, studiando il multigrafo a disposizione. 

Il multigrafo diretto contiene nodi con un grado (sia entrante che uscente) molto elevato (anche fino a 20-30 archi uscenti, senza considerare quelli entranti), ed è quindi necessario adottare delle strategie per visualizzare più efficacemente tali informazioni, che altrimenti risulterebbero poco fruibili.

Il grafo è stato visualizzato mediante l'utilizzo di D3.js con [Force-Directed Graph](https://observablehq.com/@d3/force-directed-graph). Alcuni [esempi](https://observablehq.com/collection/@d3/d3-force). Più avanti sono state descritte le soluzioni adottate e le limitazioni presenti, insieme ai possibili sviluppi futuri.


## Server locale
Per visualizzare il grafo eseguire il server locale con il comando:

    ./run_http_server.sh 
    
E visitare la pagina http://localhost:8080/


## Live Demo
https://ale-pavel.github.io/infovis-final-project/


## Dataset
Il [dataset](https://github.com/ale-pavel/infovis-final-project/blob/main/dataset/hrafnkel_saga_network.xlsx) contiene le seguenti informazioni:

- Nodi (rappresentano i personaggi)
    - ```id```: codice identificativo (43 in tutto)
    - ```label```: nome del personaggio
    - ```gender```: genere del personaggio (vedere dataset)
    - ```chapter```: il capitolo in cui il personaggio appare per la prima volta
    - ```page```: la pagina in cui è menzionato per la prima volta
- Archi (rappresentano azioni tra personaggi)
    - ```source```: id del personaggio da cui parte l'azione
    - ```target```: id del secondo personaggio
    - ```action```: codice dell'azione (28 in tutto, vedere dataset)
    - ```chapter```: il capitolo in cui l'azione è descritta
    - ```page```: la pagina in cui accade


## Soluzioni adottate
### [Grafo Force-Directed](https://www.d3indepth.com/force-layout/)
Per gestire la fisica del grafo sono state usate diversi tipi di forze, in particolare:
- ```forceLink```: per definire una lunghezza minima degli archi (agiscono come molle) 
- ```forceManyBody```: definisce forze attrattive o repulsive (con valore negativo, qui usate) per allontanare tra loro i nodi
- ```forceCollide```: previene la sovrapposizione tra nodi
- ```forceCenter```: imposta il centro di gravità verso il centro del viewport
-  [Bounding box](https://bl.ocks.org/puzzler10/2531c035e8d514f125c4d15433f79d74) per evitare che i nodi spariscano dal viewport

Inoltre è possibile fare panning e zoom sull'interfaccia, vedere [esempio](https://observablehq.com/@d3/zoom?collection=@d3/d3-zoom).

### Gestione di archi diretti e label
Sono stati utilizzati diversi esempi di codice D3.js per integrare funzionalità utili alla visualizzazione: 
- [Label su archi e frecce di direzione](http://bl.ocks.org/fancellu/2c782394602a93921faff74e594d1bb1): Gli archi diretti necessitano di frecce per mostrare la loro direzione, e di label testuali per identificare le azioni tra personaggi. Senza ulteriori modifiche i numerosi archi/label si sovrapporrebbero tra loro.
- [Gestione di archi multipli](https://bl.ocks.org/mattkohl/146d301c0fc20d89d85880df537de7b0): Mediante la curvatura degli archi (dipendente dal numero di archi che collegano ogni coppia di nodi) è possibile evitare che essi siano sovrapposti, permettendo una maggiore comprensione del grafo.
- [Evidenziare archi e label col mouse](http://jsfiddle.net/2pdxz/2/): Per permettere di fruire meglio della visualizzazione le label e gli archi vengono visualizzati con una minore opacità, che viene aumentata quando l'utente interagisce coi nodi di interesse (facendo hovering del mouse). In particolare vengono evidenziati gli archi uscenti dal nodo selezionato, con le relative label.


## Limitazioni
Il calcolo delle curvature degli archi introduce un maggiore carico computazionale, che risulta meno gradevole per l'utente che fruisce dell'applicazione (rispetto al framerate che si ottiene senza questa funzionalità). 

Una [soluzione](https://observablehq.com/@d3/mobile-patent-suits) alternativa all'utilizzo di label testuali è quella di usare archi colorati rappresentanti i diversi tipi di azioni, ma ciò non è realizzabile per questo caso d'uso, essendoci quasi 30 azioni diverse (a meno di non raggrupparle per tipologie, ma non è banale farlo e il risultato non garantirebbe precisione nel visionare il grafo). Inoltre l'esempio è valido solo per grafi con grado pari al massimo a 2 (curvatura calcolata staticamente).

Nel dataset è presente un arco che parte dal nodo 9 (Hrafnkel) e finisce nel nodo 9, ovvero un autociclo. Non è chiaro perché questo arco non venga caricato da D3.js dentro ```links```, e non è visualizzabile nell'applicazione. Un [esempio](https://bl.ocks.org/mattkohl/08fe7f53f592ab699ea15af46be04c48) implementa la funzionalità richiesta, anche per archi multipli.


## Sviluppi Futuri
Lo sfruttamento della componente temporale potrebbe essere fondamentale per visualizzare bene questo grafo, usando come informazione il capitolo dei personaggi e delle azioni (il numero di pagina è mancante troppo spesso). Questa soluzione consente di visualizzare un sottoinsieme di nodi e archi alla volta, e di analizzare la storia seguendo una linea temporale causale, il che consentirebbe una comprensione sicuramente migliore. Un [esempio](https://observablehq.com/@d3/temporal-force-directed-graph) D3.js implementa tale funzionalità.

L'utilizzo di [forze](https://www.d3indepth.com/force-layout/#forcex-and-forcey) come ```forceX``` e ```forceY``` può essere molto utile per posizionare i nodi in una configurazione migliore, senza dover gestire il tweaking delle forze già definite (che non è sempre triviale). Tuttavia ciò richiederebbe di definire nuovi campi nel dataset che specifichino posizioni x e y per ogni nodo.

Per gestire meglio le label degli archi (che a volte sono poco leggibili per nodi con grado elevato) si potrebbe visualizzare la lista di azioni in una finestra popup che viene mostrata solo quando si fa hovering del mouse sul nodo/arco di interesse, vedere [esempio](https://bl.ocks.org/almsuarez/fa9502b0087b829ef4d97e5d6d5ccfde). In questo modo non si avrebbe più necessità di visualizzare testo contemporaneamente, ma solo dove l'utente lo richiede, migliorando la leggibilità.

Un'altra soluzione per gestire i numerosi archi e label è quella di compattarli in un unico arco, e gestire la lista di azioni risultante con delle icone. Queste icone saranno diverse per ogni azione del dataset, e verranno visualizzate in punti diversi dell'arco evitando sovrapposizione. Inoltre è necessario selezionare i nodi con azioni onclick, per poter poi fare hovering sulle icone per avere una descrizione dell'azione (o usare una legenda). Per fare rendering di immagini png sugli archi vedere questo [esempio](https://stackoverflow.com/questions/32143614/force-directed-graph-how-to-add-icon-in-the-middle-of-an-edge). Inoltre sono state già scaricate delle icone per una possibile implementazione di questa funzionalità, [qui](https://github.com/ale-pavel/infovis-final-project/tree/feature/icons-labels/icons) disponibili (branch feature/icons-labels).

Un possibile modo di gestire la densità dei nodi è mediante una forza repulsiva, attivata quando si fa click su un nodo (che rimane fermo). In questo [esempio](https://observablehq.com/@d3/collision-detection/2?collection=@d3/d3-force) l'hovering del mouse sposta i diversi nodi.
