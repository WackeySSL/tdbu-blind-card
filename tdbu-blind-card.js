class TDBUMushroomStyleCard extends HTMLElement {
  _isDraggingTop = false;
  _isDraggingBottom = false;
  _hasButtons = true;
  _sliderWidth = '80px';
  _pickerHeight = 10; // Denne er stadig 10, som du ændrede den til
  _userInteractedTop = false;
  _userInteractedBottom = false;
  _lastSetTopPosition = null;
  _lastSetBottomPosition = null;
  _disableIfSensorOpen = null; // Ny variabel til den valgfri binære sensor

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._render();
      this._initialized = true;
    }
    this._updateStates();
  }

  setConfig(config) {
    if (!config.entity_bottom) {
      throw new Error("Define entity_bottom");
    }
    this._config = config;
    this._hasButtons = config.show_buttons !== false;
    this._sliderWidth = config.slider_width || '80px';
    this._disableIfSensorOpen = config.disable_if_sensor_open || null; // Læs valgfri sensor
  }

  getCardSize() {
    return 3;
  }

  _render() {
    const shadow = this.attachShadow({ mode: "open" });
    const hasTopEntity = !!this._config.entity_top;
    const buttonColumnStyle = this._hasButtons ? `
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-right: 12px;
        ` : 'display: none;';
    const nameHTML = this._config.name ? `<div class="name">${this._config.name}</div>` : '';

    const wrapperStyle = this._hasButtons ? `
          display: flex;
          align-items: center;
          padding: 16px;
        ` : `
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
        `;

    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .wrapper {
          ${wrapperStyle}
          background-color: var(--card-background-color, #1e1e1e);
          color: var(--primary-text-color, #fff);
          border-radius: var(--ha-card-border-radius, 12px);
          transition: opacity 0.3s ease-in-out; /* Tilføj transition for visuel effekt */
        }
        .wrapper.disabled {
          opacity: 0.5; /* Dæmpet, når deaktiveret */
          pointer-events: none; /* Deaktiver interaktion */
        }
        .buttons {
          ${buttonColumnStyle}
        }
        .buttons button {
          background: none;
          border: none;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
        }
        .buttons button:hover { color: var(--accent-color, #ffc107); }

        .slider-background {
          position: relative;
          width: ${this._sliderWidth};
          height: 150px;
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-image: url(data:image/png;base64,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);
        }

        .slider-box {
          position: absolute;
          top: 20px; /* Padding fra toppen af slider-background */
          left: 0;
          width: 100%;
          height: calc(100% - 20px); /* Juster højden til at tage højde for padding */
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .picker {
          position: absolute;
          width: 100%;
          height: ${this._pickerHeight}px;
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAAAHCAYAAADuzmQ5AAAABGdBTUEAALGeYUxB9wAAACBjSFJNAACHCwAAjBIAAP70AAB/DgAAgQYAAOhBAAA54AAAHiqESS3PAAAA22lDQ1BJQ0MgUHJvZmlsZQAAKM9jYGB8wAAETECcm1dSFOTupBARGaXAfoGBEQjBIDG5uMA32C2EASf4dg2i9rIuA+mAs7ykoARIfwBikaKQIGegm1iAbL50CFsExE6CsFVA7CKgA4FsE5D6dAjbA8ROgrBjQOzkgiKgmYwFIPNTUouTgewGIDsB5DeItZ9ZwW5mFFVKLi0qg7qFkcmYgYEQH2FGHjsDg9lVBgbm/Qix1G4Ghm0nGRjE5RBiykC3CyUyMOxIKkmtKEH2PMRtYMCWXwAMfQZqAgYGAC7ONG+WT8jJAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB5klEQVRYR+2XwWrCQBCGs2li7KmQCqJ46qVv0KeofRZfpM/Qk4fqQ0jRkydBBKGnHnopNmJiAjFp0v9Ps2UrEmyLtEI+GGYzOzMbsz+bKObzeadWq91qJSW/wPf9O8/zZmIymXTr9XrbNM0q4inQhBAfWcWkMAO5ES/gN6xDfTVJkhOEYoY5V/L/Ufed3rKsLBaG4Zc5iYzpus5x4jjOwnXdoRiNRv1Go9E2DMOSibsaFMGG+TADtXo+LDki1L2nUAh0oUVRtFMTjOWCSiEmZ71eD8R4PL5vtVo3KKwyQdq+gkLuGxwFxVOJp5Y8ueBKjg3ufRzHWqVSyTwFhTdONlcgqGS5XC7wynsQ0+m032w222iQnVD7ojRzsZCBRSlprmjiujyhjhApJgqHe0u/LSIVqQHsfYpXngNBDfjK6+Kj/Fp+QzGxqIkEzVI009EsQD7FyNoNzKQhniBOcFlyCLihNMLn/JNnLXuwFj6FoNjEkv1gIdPgSVYjYV1+qCSr1eoVghqKXq/XsW37CoIymQAdZEl7wF9yDouxUB3mo/6J94TYqdrnGz3/HHmv8uHJZ0LUuITzpCjnUGzv1/a9F6HUYphmDeA91D7DXjDmn6wL+DNMPcJf4tqGfX4vK+vxG8oNgmD2Di0RPo9DidC/AAAAAElFTkSuQmCC);
          background-repeat: no-repeat;
          cursor: pointer;
          z-index: 2;
        }

        #picker-top {
          top: 0; /* Relativt til slider-box */
        }

        #picker-bottom {
          bottom: 0; /* Relativt til slider-box */
          z-index: 1;
        }
        .covered-area {
          position: absolute;
          left: 0;
          width: 100%;
          background-color: #FFEC8B; /* LightGoldenrodYellow */
          z-index: 1;
        }
        .name {
          margin-top: 8px;
          font-size: 14px;
          color: var(--secondary-text-color, #9e9e9e);
          text-align: center;
          width: ${this._sliderWidth};
        }
      </style>
      <div class="wrapper">
        <div class="buttons">
          <button id="btn-top-up">⬆️</button>
          <button id="btn-stop">⏹️</button>
          <button id="btn-bottom-down">⬇️</button>
        </div>
        <div class="slider-container">
          <div class="slider-background">
            <div class="slider-box">
              <div class="covered-area" id="covered-area"></div>
              ${hasTopEntity ? '<div class="picker" id="picker-top" style="top: 0px;"></div>' : ''}
              <div class="picker" id="picker-bottom" style="bottom: 0px;"></div>
            </div>
          </div>
          ${nameHTML}
        </div>
      </div>
    `;

    // gem references
    this._pickerBottom = shadow.getElementById("picker-bottom");
    this._coveredArea = shadow.getElementById("covered-area");
    this._sliderBox = shadow.querySelector(".slider-box");
    this._sliderBackground = shadow.querySelector(".slider-background");
    this._buttonContainer = shadow.querySelector(".buttons"); // Reference til knapcontainer
    this._wrapper = shadow.querySelector(".wrapper");

    const btnTopUp = shadow.getElementById("btn-top-up");
    if (btnTopUp) {
      btnTopUp.addEventListener("click", () => {
        if (this._config.entity_top) {
          this._call("set_cover_position", this._config.entity_top, 1);
        }
        if (this._config.entity_bottom) {
          this._call("set_cover_position", this._config.entity_bottom, 99);
        }
      });
    }

    if (this._config.entity_top) {
      this._pickerTop = shadow.getElementById("picker-top");
      this._setupPickerDrag("top");
    } else {
      this._isDraggingTop = true; // Forhindrer opdatering af ikke-eksisterende picker
    }

    if (this._hasButtons) {
      const btnStop = shadow.getElementById("btn-stop");
      if (btnStop) {
        btnStop.addEventListener("click", () => {
          if (this._config.entity_top) {
            this._call("stop_cover", this._config.entity_top);
          }
          this._call("stop_cover", this._config.entity_bottom);
        });
      }
      const btnBottomDown = shadow.getElementById("btn-bottom-down");
      if (btnBottomDown) {
        btnBottomDown.addEventListener("click", () => {
          if (this._config.entity_top) {
            this._call("set_cover_position", this._config.entity_top, 1);
          }
          this._call("set_cover_position", this._config.entity_bottom, 1);
        });
      }
    }

    // træk-håndtering for bottom er altid tilgængelig
    this._setupPickerDrag("bottom");
    this._updateWrapperStyle();
    this._updateCardInteractionState(); // Kald ved rendering
  }

  _updateWrapperStyle() {
    if (this._wrapper) {
      if (!this._hasButtons) {
        this._wrapper.style.justifyContent = 'center';
      } else {
        this._wrapper.style.justifyContent = 'flex-start';
      }
    }
  }

  _setupPickerDrag(type) {
    const pickerElement = type === "top" ? this._pickerTop : this._pickerBottom;
    const otherPickerElement = type === "top" ? this._pickerBottom : (this._config.entity_top ? this._pickerTop : null);
    if (!pickerElement) return;

    let isDragging = false;

    const handleStart = (e) => {
      // Afbryd hvis kortet er deaktiveret
      if (this._isCardDisabled()) {
        return;
      }

      isDragging = true;
      if (type === "top") this._isDraggingTop = true;
      else this._isDraggingBottom = true;
      e.preventDefault();

      // Original logik for startYOffset - beholdt for at matche initial kode
      // const sliderBoxRect = this._sliderBox.getBoundingClientRect();
      // let clientY;
      // if (e.touches) {
      //   clientY = e.touches[0].clientY;
      // } else {
      //   clientY = e.clientY;
      // }
      // startYOffset = clientY - parseFloat(getComputedStyle(pickerElement).top) - sliderBoxRect.top;


      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const sliderBoxRect = this._sliderBox.getBoundingClientRect();
      let clientY;
      if (e.touches) {
        clientY = e.touches[0].clientY;
      } else {
        clientY = e.clientY;
      }

      let y = clientY - sliderBoxRect.top - (pickerElement.offsetHeight / 2);
      y = Math.max(0, Math.min(sliderBoxRect.height - pickerElement.offsetHeight, y));

      if (otherPickerElement) {
        const otherPickerY = parseFloat(getComputedStyle(otherPickerElement).top);
        if (type === "top") {
          y = Math.min(y, otherPickerY - this._pickerHeight);
        } else if (type === "bottom") {
          y = Math.max(y, otherPickerY + this._pickerHeight);
        }
      }

      pickerElement.style.top = `${y}px`;
      this._updateCoveredArea();
    };

    const handleEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);

      const sliderBoxRect = this._sliderBox.getBoundingClientRect();
      const pickerY = parseFloat(getComputedStyle(pickerElement).top);
      const normalizedY = pickerY / (sliderBoxRect.height - pickerElement.offsetHeight);
      let position;

      if (type === "top") {
        position = Math.round(Math.max(0, Math.min(1, normalizedY)) * 100);
        this._userInteractedTop = true;
        this._lastSetTopPosition = position;
        if (this._config.entity_top) {
          this._call("set_cover_position", this._config.entity_top, position);
        }
        this._isDraggingTop = false;
      } else { // type === "bottom" - **TILBAGE TIL ORIGINAL LOGIK HER**
        const bottomPickerTop = parseFloat(getComputedStyle(pickerElement).top);
        const topPickerBottom = this._pickerTop ? parseFloat(getComputedStyle(this._pickerTop).top) + this._pickerHeight : -Infinity;
        const topPickerTopPositionNormalized = this._pickerTop ? parseFloat(getComputedStyle(this._pickerTop).top) / (sliderBoxRect.height - this._pickerHeight) : 0;
        const topPickerPosition = Math.round(topPickerTopPositionNormalized * 100);

        if (!this._pickerTop || bottomPickerTop <= topPickerBottom + 5) {
          if (!this._config.entity_top || topPickerPosition <= 5) {
            position = 100; // Hvis top er fraværende eller helt lukket, og bunden er "kørt helt op"
          } else {
            // Hvis top ikke er helt lukket, men bund er kørt op mod den
            position = Math.round(Math.max(0, Math.min(1, (1 - normalizedY))) * 100);
          }
        } else {
          // Standard tilfælde: 100% åben = bund af slider
          position = Math.round(Math.max(0, Math.min(1, (1 - normalizedY))) * 100);
        }
        this._userInteractedBottom = true;
        this._lastSetBottomPosition = position;
        this._call("set_cover_position", this._config.entity_bottom, position);
        this._isDraggingBottom = false;
      }
    };

    pickerElement.addEventListener("mousedown", handleStart);
    pickerElement.addEventListener("touchstart", handleStart, { passive: false });
  }

  _updateStates() {
    const topState = this._hass.states[this._config.entity_top]?.attributes.current_position;
    const bottomState = this._hass.states[this._config.entity_bottom]?.attributes.current_position;
    const sliderHeight = this._sliderBox?.getBoundingClientRect().height || 150;
    const pickerHeight = this._pickerHeight;
    const tolerance = 2;

    // Opdater kortets interaktionsstatus (enabled/disabled)
    this._updateCardInteractionState();

    if (this._pickerTop && topState !== undefined && !this._isDraggingTop && (!this._userInteractedTop || (this._lastSetTopPosition !== null && Math.abs(topState - this._lastSetTopPosition) <= tolerance))) {
      const topY = (topState / 100) * (sliderHeight - pickerHeight);
      this._pickerTop.style.top = `${topY}px`;
      this._userInteractedTop = false;
      this._lastSetTopPosition = null;
    } else if (this._pickerTop && this._userInteractedTop) {
      // Beholder den visuelle position sat af brugeren
    }

    if (this._pickerBottom && bottomState !== undefined && !this._isDraggingBottom && (!this._userInteractedBottom || (this._lastSetBottomPosition !== null && Math.abs(bottomState - this._lastSetBottomPosition) <= tolerance))) {
      // **TILBAGE TIL ORIGINAL LOGIK HER FOR BOTTOM PICKER**
      let targetBottomY = (bottomState / 100) * (sliderHeight - pickerHeight);
      let finalBottomY = sliderHeight - pickerHeight - targetBottomY; // Denne linje er crucial for den originale logik

      if (this._pickerTop) {
        const topY = parseFloat(getComputedStyle(this._pickerTop).top);
        finalBottomY = Math.max(topY + this._pickerHeight, finalBottomY);
      }

      this._pickerBottom.style.top = `${finalBottomY}px`;
      this._userInteractedBottom = false;
      this._lastSetBottomPosition = null;
    } else if (this._pickerBottom && this._userInteractedBottom) {
      // Beholder den visuelle position sat af brugeren
    }

    this._updateCoveredArea();
  }

  _isCardDisabled() {
    if (this._disableIfSensorOpen) {
      const sensorState = this._hass.states[this._disableIfSensorOpen];
      // 'on' betyder åben for binære sensorer af typen window/door
      return sensorState && sensorState.state === 'on';
    }
    return false; // Ikke deaktiveret hvis sensor ikke er konfigureret eller er 'off'
  }

  _updateCardInteractionState() {
    if (this._wrapper) {
      if (this._isCardDisabled()) {
        this._wrapper.classList.add('disabled');
      } else {
        this._wrapper.classList.remove('disabled');
      }
    }
  }

  _updateCoveredArea() {
    const sliderBoxRect = this._sliderBox?.getBoundingClientRect();
    const pickerTopY = this._pickerTop ? parseFloat(getComputedStyle(this._pickerTop).top) : 0;
    // Original logik: Hvis top picker ikke eksisterer, starter covered area fra 0
    const bottomOfSliderBox = sliderBoxRect ? sliderBoxRect.height - this._pickerHeight : 130; // Default bottom hvis sliderBoxRect ikke er klar
    const pickerBottomY = this._pickerBottom ? parseFloat(getComputedStyle(this._pickerBottom).top) : bottomOfSliderBox; // Default bottom hvis top mangler

    if (sliderBoxRect) {
      const topOfCovered = this._pickerTop ? pickerTopY : 0; // Covered area starts from top picker's top edge
      const heightOfCovered = Math.max(0, pickerBottomY - topOfCovered); // Height is difference between pickers' top edges

      this._coveredArea.style.top = `${topOfCovered}px`;
      this._coveredArea.style.height = `${heightOfCovered}px`;
    }
  }

  _call(service, entity, position = null) {
    if (!entity) return;

    // Tjek om kortet er deaktiveret på grund af den binære sensor
    if (this._isCardDisabled()) {
      console.warn(`TDBUMushroomStyleCard: Forsøg på at styre ${entity} blokeret, da døren (${this._disableIfSensorOpen}) er åben.`);
      // Du kan eventuelt give visuel feedback til brugeren her (f.eks. en popup)
      return; // Stop servicekaldet
    }

    const [domain, svc] = ["cover", service];
    const data = { entity_id: entity };
    if (position !== null) data.position = position;
    this._hass.callService(domain, svc, data);
  }
}
customElements.define('tdbu-mushroom-style-card', TDBUMushroomStyleCard);
