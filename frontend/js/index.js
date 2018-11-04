$(document).ready(() => {  
    let socket = io();
    cardsSelected = [];
    playerCards = [];
    specialCards = [];
    leaderCards = [];
    submitCounter = 0;
    cardsInHand = [];
    differentCard = false;


    socket.on('connect', function () {
        console.log("Connected to server");
    });

    socket.on('startGame', function(cards) {
        playerCards = cards;
        $('#StartGame').show();
        $('#announce').hide();
        console.log("Game Start");
        console.log(cards);
        $('#StartGame').click(() => {
            $('.gameLobby').hide();
            $('#cards').show();
            appendCardsToDom(playerCards);
            playerCardSelector(playerCards);
            submitCards(socket);
        })
    });

    socket.on('sendSpecial', function(cards) {
        cardsSelected = [];
        specialCards = cards;
        $('.row').empty();
        appendCardsToDom(specialCards);
        cardSelector(specialCards);
        submitSpecial(socket);
    })

    socket.on('sendLeader', function(cards) {
        cardsSelected = [];
        leaderCards = cards;
        $('.row').empty();
        appendCardsToDom(leaderCards);
        cardSelector(leaderCards);
        submitLeader(socket);
    })

    socket.on('boardRender', function(message) {
        console.log(message);
        $('#cards').hide();
        $('#info').show();
        $('#board').show();
        generateBoard();
        for (let aux of cardsInHand) {
            $('#hand').append(makeHandCard(aux));
        }
        showCard();
        playCard();
        showBoardCards();
    })

    socket.on('disconnect', function () {
        //alert("Too many players");
        console.log('User was disconnected');
    });
});

function appendCardsToDom (cardList) {
    if (cardList.length === 10) {
        for (let card of cardList) {
            $('#cards > .row').append(makeSpecialCard(card));
        }
    } else if (cardList.length === 2) {
        for (let card of cardList) {
            $('#cards > .row').append(makeSpecialCard(card));
        }
    } else {
        for (let card of cardList) {
            $('#cards > .row').append(makeCard(card));
        }
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
        if (submitCounter === 0) {
            if (cardsSelected.length === 11) {
                submitCounter++;
                for(let aux of cardsSelected)
                    cardsInHand.push(aux);
                playerCardsSelected = cardsSelected;
                socket.emit('cardsSubmit', cardsSelected);
            } else if (cardsSelected.length < 11) {
                alert("You haven't selected enough cards");
            } else {
                alert("You have selected too many cards");
            }
        }
    })
}

function submitSpecial (socket) {
    $('#sumbitCards').click(function () {
        if (submitCounter === 1) {
            if (cardsSelected.length === 5) {
                submitCounter++;
                for(let aux of cardsSelected)
                    cardsInHand.push(aux);
                specialCardsSelected = cardsSelected;
                socket.emit('submitSpecial', cardsSelected);
            } else if (cardsSelected.length < 5) {
                alert("You haven't selected enough cards");
            } else {
                alert("You have selected too many cards");
            }
        }
    })
}

function submitLeader (socket) {
    $('#sumbitCards').click(function () {
        if (submitCounter === 2) {
            if (cardsSelected.length === 1) {
                submitCounter++;
                for(let aux of cardsSelected)
                    cardsInHand.push(aux);
                socket.emit('submitLeader', cardsSelected);
            } else if (cardsSelected.length < 1) {
                alert("You haven't selected enough cards");
            } else {
                alert("You have selected too many cards");
            }
        }
    })
}

function playerCardSelector (cards) {
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
    return `<div col-md-2">
              <div class="card" alt=${cardInfo.name}>
                  <h4 id="name">${cardInfo.name}</h4>
                  <hr>
                  <img width="160" height="100" src="${cardInfo.image}" />
                  <hr>
                  <div class="row">
                      <div class="col-xs-4">
                          <h5 id="type">${cardInfo.type}</h5>
                      </div>
                      <div class="col-xs-5">
                          <h5 id="club" style="padding-left:60px;">${cardInfo.club}</h5>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-xs-4">
                          <div class="atack">
                              <h5 class="bold">&nbsp;A ${cardInfo.attack}</h5>
                          </div>
                      </div>
                      <div class="col-xs-3">
                           <div class="country">
                                <h6 class="bold">${cardInfo.country}</h6>
                           </div>
                      </div>
                      <div class="col-xs-4 defence">
                          <div class="defence">
                              <h5 class="bold">D ${cardInfo.defence}</h5>
                          </div>
                      </div>
                  </div>
              </div>
            </div>`
}

function makeSpecialCard (cardInfo) {
    return `<div col-3">
              <div class="card" alt=${cardInfo.name}>
                  <h3 id="name">${cardInfo.name}</h3>
                  <hr>
                  <div class="row" style="padding: 15px;">
                        <h3 id="description">${cardInfo.description}</h3>
                  </div>
              </div>
            </div>`
}

function cardSelector (cards) {
    $('.card').click(function () {
        let pos = cards.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        if (cardsSelected.includes(cards[pos])) {
            let position = cardsSelected.indexOf(cards[pos]);
            cardsSelected.splice(position,1);
            $(this).removeClass('clicked');
            console.log(cardsSelected);
        } else {
            cardsSelected.push(cards[pos]);
            $(this).addClass('clicked');
            console.log(cardsSelected);
        }
    });
}

function renderBoard (){
    return `<div class="row" style="height:100%;">
                <div class="col-md-3" id="info">
                    <div class="cardShowed"></div>
                </div>
                <div class="col-md-9" id="board">
                </div>
            </div>`;
}

function makeHandCard (cardInfo) {
    return `<div class="mini-card" id=${cardInfo.name} alt=${cardInfo.name}>
                <img width="50" height="50" src="${cardInfo.miniCard}" />
            </div>`;
}

function showCard () {
    let pos;
    $('.mini-card').click(function () {
        $('#info > .cardShowed').empty();
        pos = cardsInHand.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        if (cardsInHand[pos].type) {
            $('#info > .cardShowed').append(makeCard(cardsInHand[pos]));
        } else {
            $('#info > .cardShowed').append(makeSpecialCard(cardsInHand[pos]));
        }
    });
}

function showBoardCards () {
    let pos;
    $('#m-mid').on('click', '.mini-card', (function () {
        $('#info > .cardShowed').empty();
        pos = playerCards.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        $('#info > .cardShowed').append(makeCard(playerCards[pos]));
    }));
    $('#m-goalkeeper').on('click', '.mini-card', (function () {
        $('#info > .cardShowed').empty();
        pos = playerCards.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        $('#info > .cardShowed').append(makeCard(playerCards[pos]));
    }));
    $('#m-defence').on('click', '.mini-card', (function () {
        $('#info > .cardShowed').empty();
        pos = playerCards.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        $('#info > .cardShowed').append(makeCard(playerCards[pos]));
    }));
    $('#m-attack').on('click', '.mini-card', (function () {
        $('#info > .cardShowed').empty();
        pos = playerCards.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        $('#info > .cardShowed').append(makeCard(playerCards[pos]));
    }));
}

function playCard () {
    let pos;
    $('.mini-card').click(function () {
        differentCard = true;
        console.log(cardsInHand);
        pos = cardsInHand.map(function(e) { return e.name; }).indexOf($(this).attr('alt'));
        $('#m-goalkeeper').click(function () {
            if (differentCard) {
                if (cardsInHand[pos].type) {
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    differentCard = false;
                    $(`#${cardsInHand[pos].name}`).empty();
                    $('#m-goalkeeper').append(makeHandCard(cardsInHand[pos]));
                    cardsInHand.splice(pos,1);
                } else if (cardsInHand[pos].description) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    console.log(cardsInHand[pos].name + " played");
                    $(`#${cardsInHand[pos].name}`).empty();
                    cardsInHand.splice(pos,1);
                }
            }
        });
        $('#m-defence').click(function () {
            if (differentCard) {
                if (cardsInHand[pos].type) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    $(`#${cardsInHand[pos].name}`).empty();
                    $('#m-defence').append(makeHandCard(cardsInHand[pos]));
                    cardsInHand.splice(pos,1);
                    //$(this).remove();
                } else if (cardsInHand[pos].description) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    console.log(cardsInHand[pos].name + " played");
                    $(`#${cardsInHand[pos].name}`).empty();
                    cardsInHand.splice(pos,1);
                }
            }
        });
        $('#m-mid').click(function () {
            if (differentCard) {
                if (cardsInHand[pos].type) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    $(`#${cardsInHand[pos].name}`).empty();
                    $('#m-mid').append(makeHandCard(cardsInHand[pos]));
                    cardsInHand.splice(pos,1);
                    //$(this).remove();
                } else if (cardsInHand[pos].description) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    console.log(cardsInHand[pos].name + " played");
                    $(`#${cardsInHand[pos].name}`).empty();
                    cardsInHand.splice(pos,1);
                }
            }
        });
        $('#m-attack').click(function () {
            if (differentCard) {
                if (cardsInHand[pos].type) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    $(`#${cardsInHand[pos].name}`).empty();
                    $('#m-attack').append(makeHandCard(cardsInHand[pos]));
                    cardsInHand.splice(pos,1);
                    //$(this).remove();
                } else if (cardsInHand[pos].description) {
                    differentCard = false;
                    console.log(pos);
                    console.log(cardsInHand[pos]);
                    console.log(cardsInHand[pos].name + " played");
                    $(`#${cardsInHand[pos].name}`).empty();
                    cardsInHand.splice(pos,1);
                }
            }
        });
    });
}

function generateBoard () {
    $('.board-game').append(renderBoard());
    $('#board').append(`<div class="row" id="e-goalkeeper"></div>`);
    $('#board').append(`<div class="row" id="e-defence"></div>`);
    $('#board').append(`<div class="row" id="e-mid"></div>`);
    $('#board').append(`<div class="row" id="e-attack""></div>`);
    $('#board').append(`<div class="row" id="m-attack"></div>`);
    $('#board').append(`<div class="row" id="m-mid"></div>`);
    $('#board').append(`<div class="row" id="m-defence"></div>`);
    $('#board').append(`<div class="row" id="m-goalkeeper"></div>`);
    $('.board-game').append(`<div class="row" id="hand"></div>`);
}