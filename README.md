# tolkam/lib-in-view

Tracks element visibility relative to its scrolling parent.

## Usage

````ts
import InView, { IVisibility } from '@tolkam/lib-in-view';

const elementToTrack = document.getElementById('trackMe')!;

const inView = new InView(elementToTrack, (visibility: IVisibility) => {
    if(visibility.rendered && visibility.visible) {
        console.log("I'm visible!");
        inView.stop();
    }
});
````

## Documentation

The code is rather self-explanatory and API is intended to be as simple as possible. Please, read the sources/Docblock if you have any questions. See [Usage](#usage) for quick start.

## License

Proprietary / Unlicensed 🤷
