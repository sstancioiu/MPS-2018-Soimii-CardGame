$(document).ready(() => {  
    let socket = io();
    cardsSelected = [];

    socket.on('connect', function () {
        console.log("Connected to server");
    });

    socket.on('startGame', function(cards) {
        $('#StartGame').show();
        $('#announce').hide();
        console.log("Game Start");
        console.log(cards);
        $('#StartGame').click(() => {
            $('.gameLobby').hide();
            $('#cards').show();
            appendCardsToDom(cards);
            cardSelector(cards);
            submitCards(socket);
        })
    });

    socket.on('disconnect', function () {
        //alert("Too many players");
        console.log('User was disconnected');
    });
});

function appendCardsToDom (cardList) {
    for (let card of cardList) {
        $('#cards > .row').append(makeCard(card));
    }
}

function showNumberOfSelectedCards (cardsSelected) {
    $('.cards-number').text(`Selected ${cardsSelected.length} cards`);

    let gkNum = cardsSelected.filter(card => card.type.includes("GK")).length;
    let dfNum = cardsSelected.filter(card => card.type.includes("DF")).length;
    let mfNum = cardsSelected.filter(card => card.type.includes("MF")).length;
    let fwNum = cardsSelected.filter(card => card.type.includes("FW")).length;

    $('.cards-number').append(`<br>GK: ${gkNum}/1<br>`);
    $('.cards-number').append(`DF: ${dfNum}/6<br>`);
    $('.cards-number').append(`MF: ${mfNum}/6<br>`);
    $('.cards-number').append(`FW: ${fwNum}/6`);
}

function submitCards (socket) {
    $('#sumbitCards').click(function () {
        if (cardsSelected.length === 11) {
            socket.emit('cardsSubmit', cardsSelected);
        } else if (cardsSelected.length < 11) {
            alert("You haven't selected enough cards");
        } else {
            alert("You have selected too many cards");
        }
    })
}

function cardSelector (cards) {
    $('.card').click(function () {
        let pos = cards.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        if (cardsSelected.includes(cards[pos])) {
            let position = cardsSelected.indexOf(cards[pos]);
            cardsSelected.splice(position,1);
            $(this).removeClass('clicked');
            console.log(cardsSelected);
        } else if (cardsSelected.length < 11) {
            let numberOfSameType = cardsSelected.filter(
                card => card.type.includes(cards[pos].type)
            ).length;
            if (cards[pos].type.includes("GK") && numberOfSameType >= 1) {
                alert("Too many GK");
            } else if (numberOfSameType >= 6) {
                alert("Too many " + cards[pos].type);
            } else {
                cardsSelected.push(cards[pos]);
                $(this).addClass('clicked');
                console.log(cardsSelected);
            }
        } else {
            alert("You have selected too many cards");
        }
        showNumberOfSelectedCards(cardsSelected);
    });
}

function makeCard (cardInfo) {
    return `<div col-3">
              <div class="card" alt=${cardInfo.name}>
                  <h3 id="name">${cardInfo.name}</h3>
                  <hr>
                  <img width="200" height="140" src="${cardInfo.image}" />
                  <hr>
                  <div class="row">
                      <div class="col-xs-6">
                          <h3 id="type">${cardInfo.type} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</h3>
                      </div>
                      <div class="col-xs-6">
                          <h3 id="club">&nbsp;${cardInfo.club}</h3>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-xs-4">
                          <div class="atack">
                              <h3 class="bold">A ${cardInfo.attack}</h2>
                          </div>
                      </div>
                      <div class="col-xs-3">
                           <div class="country">
                                <h4 class="bold">${cardInfo.country}</h4>
                           </div>
                      </div>
                      <div class="col-xs-4 defence">
                          <div class="defence">
                              <h3 class="bold">D ${cardInfo.defence}</h2>
                          </div>
                      </div>
                  </div>
              </div>
            </div>`
}
