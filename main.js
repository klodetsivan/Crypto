/// <reference path="jquery-3.6.0.js" />

$(() => {

    let coins = [];
    const choosenCoins = new Map();
    const favorite = [];
    let sixthCoin;


    //single page with sections
    $("section").hide();
    $("#homeSection").show();

    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide();
        $("#" + dataSection).show();
    });

    // Showing additional coin info
    $("#homeSection").on("click", ".card > button", async function () {
        const coinId = $(this).attr("id");
        const coin = await getMoreInfo(coinId);
        if ($(this).next().hasClass("moreInfo") === false) {
            $(this).text("Less info");
            $(this).next().addClass("moreInfo");
            if (choosenCoins.has(coinId)) {
                let choosenCoin = choosenCoins.get(coinId);
                getMoreCoinInfo(coinId, choosenCoin);
            }
            else {
                $(this).next().append(`<div><img class="loader" src="/assets/gif/loading3.gif" alt="load"></div>`);
                setTimeout(function () {
                    let newCoin = coin.market_data.current_price;
                    getMoreCoinInfo(coinId, newCoin);
                    choosenCoins.set(coinId, { ils: coin.market_data.current_price.ils, usd: coin.market_data.current_price.usd, eur: coin.market_data.current_price.eur });
                    setTimeout(() => choosenCoins.delete(coinId), 120000);
                }, 1000);
            }
        }
        else {
            $(this).text("More Info");
            $(this).next().fadeOut(500).removeClass("moreInfo");
        }
    });


    // const allCoins = loadCoinsFromStorage();
    // setTimeout(() => {
    //     saveCoinsToStorage(allCoins);
    // }, 10000);

    // display more info for choosen coin 
    function getMoreCoinInfo(coinId, choosenCoin) {
        $(`#${coinId}`).next().html(`
             <div class="moreInfoContainer">
             &#0036 ${choosenCoin.usd} <br>
             &#8364 ${choosenCoin.eur} <br>
             ILS ${choosenCoin.ils}
             </div>
             `).fadeIn(500);
    }

    // Delete coin
    function deleteCoin(coin) {
        const selectedCoins = favorite;
        const index = favorite.indexOf(coin);
        selectedCoins.splice(index, 1);
    }



    // //Toggle
    $("#homeSection").on("click", "i", async function () {
        const coinId = $(this).parent().attr("class");
        const coin = await getMoreInfo(coinId);
        const coinName = `${coin.id}`
        sixthCoin = coinName;
        const top5 = $(this).hasClass("fa-solid fa-toggle-on");
        if (!top5) {
            $(this).removeClass("fa-solid fa-toggle-off");
            $(this).addClass("fa-solid fa-toggle-on");
            if (favorite.length < 5) {
                favorite.push(coinName);
            }
            else {
                $(this).removeClass("fa-solid fa-toggle-on");
                $(this).addClass("fa-solid fa-toggle-off");
                let sixthCoin = `To add "${coinName}",you first must unselect one of the following:`
                $(".modal-content").append(sixthCoin);
                for (let i = 0; i < favorite.length; i++) {
                    let div = `
                    <div class="favoriteCoinContainer">
                    <div class="digitalCoin">${favorite[i]}</div>
                    <div class="choosen" id="${i}">
                    <i class="fa-solid fa-toggle-on"></i>
                     </div>
                    </div>`
                    $(".modal-content").append(div)
                }
                $(".modal").css("display", "block")

                $(".choosen").on("click", ".choosen > i",(favorite) => {
                    const coinId = $(this).attr("id");
                    // const coinId = $(this).children().attr("class");
                    //   console.log(favorite);
                    alert(coinId);

                    $(this).removeClass("fa-solid fa-toggle-on");
                    $(this).addClass("fa-solid fa-toggle-off");
                    // favorite.splice(this, 1);
                    // favorite.push(this);
                })
            }
        }
        else {
            deleteCoin($(this));
            $(this).removeClass("fa-solid fa-toggle-off");
            $(this).addClass("fa-solid fa-toggle-on");
        }
    });



    // // load coins from Storage 
    // function loadCoinsFromStorage() {

    //     const str = localStorage.getItem("coins");
    //     if (!str) {
    //         return [];
    //     }
    //     const coins = JSON.parse(str);
    //     return coins;

    // }

    // // save coins to Storage 
    // function saveCoinsToStorage(favorite) {
    //     const str = JSON.stringify(allCoins);
    //     localStorage.setItem("coins", str);
    // }


    //search box
    $("input[type=search]").on("keyup", function () {

        const textToSearch = $(this).val().toLowerCase();
        if (textToSearch === "") {
            displayCoins(coins);
        }
        else {
            const filteredCoins = coins.filter(c => c.symbol.includes(textToSearch));

            if (filteredCoins.length <= 0) {
                return displayCoins(coins);
            }
            displayCoins(filteredCoins);
        }
    });

    handleCoins();
    // Getting coins from server
    async function handleCoins() {
        try {
            coins = await getJSON("https://api.coingecko.com/api/v3/coins");
            displayCoins(coins);
        }
        catch (err) {
            alert(err.message);
        }
    }

    // Displaying coins on page
    function displayCoins(coins) {
        let content = "";
        for (const coin of coins) {
            const card = createCard(coin);
            content += card;
        }
        $("#homeSection").html(content)

    }

    // Create card
    function createCard(coin) {
        const card = `
              <div class="card">
              <div class=${coin.id}>
             <i class="fa-solid fa-toggle-off"></i>
              </div>
                <span>${coin.symbol}</span> <br>
                <span>${coin.name}</span> <br>
                <img src="${coin.image.thumb}" /> <br>
                <button id="${coin.id}">More Info</button>
                <span></span>
            </div>
        `;
        return card;
    }


    // Get more info about coin
    async function getMoreInfo(coinId) {
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/" + coinId);
        console.log(coin);
        return coin;
    }

    // Getting JSON from url
    function getJSON(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                success: data => {
                    resolve(data);
                },
                error: err => {
                    reject(err);
                }
            })
        });
    }

});




