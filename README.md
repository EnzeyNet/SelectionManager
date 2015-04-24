SelectionManager
================

Angular directives to manage selection state and applying a class to selected elements.

Angular Module: net.enzey.selection-manager

Live Example: http://EnzeyNet.github.io/SelectionManager

### Usage
* Directives can be on different elements and can span scope hierarchy.
* All selection directives require nz-selection-manager to be set on a parent DOM element to function.
* nz-selection-class and nz-soft-selection-class require nz-selectable to be set on the same element or a child DOM element.

| Directive Name | Parameter description |
| -------- | ---------------- |
| nz-selectable | Model value to select.
| nz-selection-class | Class to apply on element when selected.
| nz-soft-selection-class | Class to apply to element for keyboard navigation and mouse hover.
| nz-selection-keyboard-navigation | If 'horizontal' or 'vertical' navigation should be done. (currently default to, and only supports, horizontal)

### nz-selection-manager Directive Parameters

| Parameter Name | Description |
| -------------- | ----------- |
| nz-multi-select | Enabled multi select. Causes nz-selection-manager to return an array.
| nz-model | The location to store the selection.

## Example Usage

### Using classes directly
```
<ul nz-selection-manager="mySelection">
  <li nz-selection-class="selectedItem" ng-repeat="item in myStuff">
    <span nz-selectable="item">{{item.name}}</span>
  </li>
</ul>
```

### Using classes set in config
```
module.config(function(nzSelectionManagerConfigProvider) {
	nzSelectionManagerConfigProvider.setSoftSelectionClass('softSelected');
	nzSelectionManagerConfigProvider.setSelectionClass('selection');
});

<ul nz-selection-manager="mySelection">
  <li nz-selection-class nz-soft-selection-class ng-repeat="item in myStuff">
    <span nz-selectable="item">{{item.name}}</span>
  </li>
</ul>
```

### Implying selection classes, on same element as nz-selectable
```
module.config(function(nzSelectionManagerConfigProvider) {
	nzSelectionManagerConfigProvider.setSoftSelectionClass('softSelected');
	nzSelectionManagerConfigProvider.setSelectionClass('selection');
});

<ul nz-selection-manager="mySelection">
  <li ng-repeat="item in myStuff" nz-selectable="item">
    <span>{{item.name}}</span>
  </li>
</ul>
```

### Spanning multiple collections
```
<ul nz-selection-manager="mySelection">
  <li nz-selectable="'Hard Coded'">
    <span>Hard Coded</span>
  </li>
  <li nz-selectable="STATIC_VALUE">
    <span>{{::STATIC_VALUE | translate}}</span>
  </li>
  <li ng-repeat="item in myStuff" nz-selectable="item">
    <span>{{item.name}}</span>
  </li>
  <li ng-repeat="(name, value) in otherStuff" nz-selectable="value">
    <span>{{value}}</span>
  </li>
</ul>
```

Alternatively nz-selectable can also be an element within a model.
```
<span nz-selectable="item.name">{{item.name}}</span>
```
