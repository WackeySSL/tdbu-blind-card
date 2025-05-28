# tdbu-blind-card
Home Assistant card for Top Down Bottom Up Blinds TDBU

### General

| Name | Type | Required | Default | Description
| ---- | ---- | -------- | ------- | -----------
| type | string | True | - | Must be "custom:tdbu-blind-card"
| name | string | False | _Friendly name of the entity_ | Name to display for the blind
| entity_top | string | False | - | The blind TOP entity ID
| entity_bottom | string | True | - | The blind bottom entity ID
| show_buttons | string | False | `true` | Show buttons on the `left` side of the blind
| slider_width | string | False | 80px | set width of the blind

### Sample

```yaml
type: 'custom:custom:tdbu-blind-card'
name: Kitchen blind
entity_top: cover.gardin_kontor_top
entity_bottom: cover.gardin_kontor_bottom
show_buttons: true
slider_width: 100px

```
![Colored Blind](https://github.com/WackeySSL/tdbu-blind-card/blob/main/Preview_blindes.png)
