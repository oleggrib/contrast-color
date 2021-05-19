const fetch = require('node-fetch');
const getColors = require('get-image-colors');
var Jimp = require('jimp');

async function getAreaPalette(imageBuffer, x, y, dx, dy, allowedTextColors){
    let image;
    let result = [];
    let diffsum;

    try {
        image = await Jimp.read(imageBuffer);
        // crop image to detect only selected area
        image.crop( x, y, dx, dy );
        let newBuff = await image.getBufferAsync(Jimp.MIME_PNG);
        // detect most used color palette
        let colors = await getColors(newBuff, {
            // count of colors
            count: 1,
            // type of input fileBuffer
            type: Jimp.MIME_PNG
        });
        allowedTextColors.forEach(palette=>{
            // we can compare differenceSumPerColorChanel between allowed color palette items and
            colors.forEach(color => {
                diffsum = 0;
                // console.log(color.hex(), palette);
                var re = /^#([\da-z]{2})([\da-z]{2})([\da-z]{2})$/i;
                var foundColor = color.hex().toLowerCase().match(re);
                var foundPalette = palette.toLowerCase().match(re);
                diffsum = Math.abs(parseInt(foundColor[1], 16) - parseInt(foundPalette[1], 16)) +
                    Math.abs(parseInt(foundColor[2], 16) - parseInt(foundPalette[2], 16)) +
                    Math.abs(parseInt(foundColor[3], 16) - parseInt(foundPalette[3], 16));

                result.push({diff: diffsum,palette});

            })
        });
        result.sort((item1,item2)=>item2.diff - item1.diff );

    } catch (e) {
        console.log('Something worng with image read:', e)
    }
    return result[0].palette;
}



(async ()=>{
    const responce = await fetch('http://alladev.com/img/i1.jpg');
    const imageBuffer = await responce.buffer();

// required in format '#xxxxxx', #xxx not allowed
    const allowedTextColors = ['#ffffff', '#000000'];

    const mostContrastColor = await getAreaPalette(imageBuffer, 10, 10, 200, 30, allowedTextColors);
    console.log(mostContrastColor);

})()
