SelectionManager
================

Angular directives to manage selection state and applying a class to selected elements.

Angular Module: net.enzey.selection-manager

### Usage
* Directives can be on different element and can span scope hierarchy.
* nz-selection-class and nz-selectable require nz-selection-manager to be set on a parent DOM element to function.
* nz-selection-class requires nz-selectable to be set on a child DOM element or the same element as itself.

| Directive Name | Parameter description |
| -------- | ---------------- |
| nz-selection-manager | Value on scope to store selection.
| nz-selection-class | Class to apply on element when selected.
| nz-selectable | Model value to select.

### nz-selection-manager Directive Parameters

| Parameter Name | Description |
| -------------- | ----------- |
| nz-multi-select | Enabled multi select. Causes nz-selection-manager to return an array.


## Current limitations
* Requires JQuery.

## Example Usage
```
<ul nz-selection-manager="mySelection">
  <li nz-selection-class="selectedItem" ng-repeat="item in myStuff">
    <span nz-selectable="item">{{item.name}}</span>
  </li>
</ul>
```
Alternatively nz-selectable can also be a element within a model.
```
<span nz-selectable="item.name">{{item.name}}</span>
```
