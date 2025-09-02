# tdbu blind card
Home Assistant card for Top Down Bottom Up Blinds TDBU

Hunter Douglas PowerView, PowerView-Hub

<a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=WackeySSL&repository=https%3A%2F%2Fgithub.com%2FWackeySSL%2Ftdbu_blind_card" target="_blank" rel="noreferrer noopener"><img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store." /></a>

### General

| Name | Type | Required | Default | Description
| ---- | ---- | -------- | ------- | -----------
| type | string | True | - | Must be "custom:tdbu_blind_card"
| name | string | False | _Friendly name of the entity_ | Name to display for the blind
| entity_top | string | False | - | The blind TOP entity ID
| entity_bottom | string | True | - | The blind bottom entity ID
| disable_if_sensor_open | binary_sensor | false | - | Sensor disable control when sensor open/door/window open
| show_buttons | string | False | `true` | Show buttons on the `left` side of the blind
| slider_width | string | False | 80px | set width of the blind

### Sample

```yaml
type: 'custom:tdbu_blind_card'
name: Kitchen blind
entity_top: cover.gardin_kontor_top
entity_bottom: cover.gardin_kontor_bottom
disable_if_sensor_open: binary_sensor.kontakt_skydedor_spisestue_window_door_is_open
show_buttons: true
slider_width: 100px

```
![Colored Blind](https://github.com/WackeySSL/tdbu-blind-card/blob/main/Preview_blindes.png)



