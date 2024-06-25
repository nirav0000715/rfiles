/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

"use strict";


import "./../style/visual.less";
import "@babel/polyfill";

import { select as event, pointer as mouse } from "d3-selection";
import powerbiVisualsApi from "powerbi-visuals-api";
import { stringExtensions as StringExtensions } from "powerbi-visuals-utils-formattingutils";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import { AdvanceCard } from "./AdvanceCard";
import { AdvanceCardData } from "./AdvanceCardData";
import { AdvanceCardVisualSettings } from "./settings";

import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataView = powerbiVisualsApi.DataView;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;

export class Visual implements IVisual {
    private settings: AdvanceCardVisualSettings;
    private host: IVisualHost;
    private tableData: powerbiVisualsApi.DataViewTable;
    private culture: string;
    private renderingEvents: powerbiVisualsApi.extensibility.IVisualEventService;

    private advanceCard: AdvanceCard;
    private advanceCardData: AdvanceCardData;
    private selectionManager: powerbiVisualsApi.extensibility.ISelectionManager;

    constructor(options: VisualConstructorOptions) {
        this.renderingEvents = options.host.eventService;
        this.host = options.host;
        this.advanceCard = new AdvanceCard(options.element);
        this.selectionManager = options.host.createSelectionManager();
    }

    public update(options: VisualUpdateOptions) {
        try {
            // let t0 = performance.now();
            this.renderingEvents.renderingStarted(options);
            if (
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.dataViews[0].table ||
                !options.dataViews[0].table.columns ||
                !options.dataViews[0].table.rows
            ) {
                return;
            } else {
                this.settings = this.parseSettings(options.dataViews[0]);
                this.tableData = options.dataViews[0].table;
            }

            this.culture = this.host.locale;

            if (this.settings.conditionSettings.conditionNumbers > 10) {
                this.settings.conditionSettings.conditionNumbers = 10;
            }
            else if (this.settings.conditionSettings.conditionNumbers <= 0) {
                this.settings.conditionSettings.conditionNumbers = 1;
            }

            const viewPortHeight: number = options.viewport.height;
            const viewPortWidth: number = options.viewport.width;

            this.advanceCardData = new AdvanceCardData(this.tableData, this.settings, this.culture);
            let dataLabelValue = this.advanceCardData.getDataLabelValue();
            let prefixLabelValue = this.advanceCardData.getPrefixLabelValue();
            let postfixLabelValue = this.advanceCardData.getPostfixLabelValue();

            this.advanceCard.updateSettings(this.settings);
            this.advanceCard.setSize(viewPortWidth, viewPortHeight);

            // Create all the respective element in DOM based on settings.
            this.createLabels(dataLabelValue, prefixLabelValue, postfixLabelValue)

            this.applyConditionalColors(dataLabelValue, prefixLabelValue, postfixLabelValue);

            this.getpostfixfontcolor();
            //this.advanceCard.updatePostfixLabelStyles();

            this.updateLabelsPositions();

            this.addUrl();

            //this.addContextMenu(options);

            this.renderingEvents.renderingFinished(options);

            // let t1 = performance.now();
            // console.log("Advance Card creation time: " + (t1 - t0).toFixed(2) + " milliseconds");
            // debugger;

        } catch (err) {
            this.renderingEvents.renderingFailed(options, <string>err);
            console.log(err);
        }
    }

    private getpostfixfontcolor (){
        if (this.advanceCardData.getPostfixLabelValue() > 0){
            this.advanceCard.updatePostfixLabelColor(this.settings.postfixSettings.color_positive);
        }
        else if (this.advanceCardData.getPostfixLabelValue() < 0){
            this.advanceCard.updatePostfixLabelColor(this.settings.postfixSettings.color_negative);
        }
        else{
            this.advanceCard.updatePostfixLabelColor(this.settings.postfixSettings.color_neutral);
        }
        
    }

    private createLabels(dataLabelValue, prefixLabelValue, postfixLabelValue) {
        if (dataLabelValue) {
            if (!this.advanceCard.dataLabelExist()) {
                this.advanceCard.createDataLabel();
            }
            if (this.settings.categoryLabelSettings.show) {
                if (!this.advanceCard.categoryLabelExist()) {
                    this.advanceCard.createCategoryLabel();
                }
            } else if (this.advanceCard.categoryLabelExist()) {
                this.advanceCard.removeCategoryLabel();
            }
        } else if (this.advanceCard.dataLabelExist()) {
            this.advanceCard.removeDataLabel();
            if (this.advanceCard.categoryLabelExist()) {
                this.advanceCard.removeCategoryLabel();
            }
        }

        if (this.settings.prefixSettings.show && prefixLabelValue) {
            if (!this.advanceCard.prefixLabelExist()) {
                this.advanceCard.createPrefixLabel();
            }
        } else if (this.advanceCard.prefixLabelExist()) {
            this.advanceCard.removePrefixLabel();
        }

        if (this.settings.postfixSettings.show && postfixLabelValue) {
            if (!this.advanceCard.postfixLabelExist()) {
                this.advanceCard.createPostfixLabel();
            }
        } else if (this.advanceCard.postfixLabelExist()) {
            this.advanceCard.removePostfixLabel();
        }

        if (this.settings.strokeSettings.show) {
            if (!this.advanceCard.strokeExists()) {
                this.advanceCard.createStroke();
            }
        } else if (this.advanceCard.strokeExists()) {
            this.advanceCard.removeStroke();
        }
        if (this.settings.backgroundSettings.show) {
            if (!this.advanceCard.fillExists()) {
                this.advanceCard.createFill();
            }
        } else if (this.advanceCard.fillExists()) {
            this.advanceCard.removeFill();
        }
    }

    private applyConditionalColors(dataLabelValue, prefixLabelValue, postfixLabelValue) {
        // Get conditional color and store it in variable.
        let conditionForegroundColor: string = undefined;
        let conditionBackgroundColor: string = undefined;
        if (this.settings.conditionSettings.show) {
            let conditionValue = this.advanceCardData.getConditionValue();
            if (conditionValue) {
                conditionForegroundColor = this.advanceCard.getConditionalColors(conditionValue, "F", this.settings.conditionSettings);
                conditionBackgroundColor = this.advanceCard.getConditionalColors(conditionValue, "B", this.settings.conditionSettings);
            }
        }

        // Update settings such as value, styles, colors etc. of all the element that were created.

        if (this.advanceCard.prefixLabelExist()) {
            this.advanceCard.updatePrefixLabelValue(prefixLabelValue);
            this.advanceCard.updatePrefixLabelStyles();
            if (conditionForegroundColor && this.settings.conditionSettings.applyToPrefix) {
                this.advanceCard.updatePrefixLabelColor(conditionForegroundColor);
            } else {
                this.advanceCard.updatePrefixLabelColor(this.settings.prefixSettings.color);
            }
        }

        if (this.advanceCard.postfixLabelExist()) {
            this.advanceCard.updatePostfixLabelValue(postfixLabelValue);
            this.advanceCard.updatePostfixLabelStyles();
            if (conditionForegroundColor && this.settings.conditionSettings.applyToPostfix) {
                this.advanceCard.updatePostfixLabelColor(conditionForegroundColor);
            } else {
                //this.advanceCard.updatePostfixLabelColor(this.settings.postfixSettings.color);
            }
        }

        if (this.advanceCard.dataLabelExist()) {
            if (this.advanceCard.categoryLabelExist()) {
                this.advanceCard.updateCategoryLabelValue(this.advanceCardData.getDataLabelDisplayName());
                this.advanceCard.updateCategoryLabelStyles();
                if (conditionForegroundColor && this.settings.conditionSettings.applyToCategoryLabel) {
                    this.advanceCard.updateCategoryLabelColor(conditionForegroundColor);
                } else {
                    this.advanceCard.updateCategoryLabelColor(this.settings.categoryLabelSettings.color);
                }
            }
            this.advanceCard.updateDataLabelValue(dataLabelValue);
            this.advanceCard.updateDataLabelTextStyle();
            if (conditionForegroundColor &&  this.settings.conditionSettings.applyToDataLabel) {
                this.advanceCard.updateDataLabelColor(conditionForegroundColor);
            } else {
                this.advanceCard.updateDataLabelColor(this.settings.dataLabelSettings.color);
            }
        }

        if (this.advanceCard.strokeExists()) {
            this.advanceCard.updateStroke(this.settings.strokeSettings);
        }

        if (this.advanceCard.fillExists()) {
            if (conditionBackgroundColor) {
                this.advanceCard.updateFill(this.settings.backgroundSettings, conditionBackgroundColor);
            } else {
                this.advanceCard.updateFill(this.settings.backgroundSettings, this.settings.backgroundSettings.backgroundColor);
            }
        }
    }

    private updateLabelsPositions() {
        // Position each element correctly in DOM.
        if (this.advanceCard.dataLabelExist()) {
            this.advanceCard.updateDataLabelTransform();
        }
        if (this.advanceCard.categoryLabelExist()) {
            this.advanceCard.updateCategoryLabelTransform();
        }
        if (this.advanceCard.prefixLabelExist()) {
            this.advanceCard.updatePrefixLabelTransform();
        }
        if (this.advanceCard.postfixLabelExist()) {
            this.advanceCard.updatePostfixLabelTransform();
        }
    }

    private addUrl() {
        let rootSVGElement = this.advanceCard.getRootElement();

        rootSVGElement.on("click", (e) => {
            if (this.settings.externalLink.show && !StringExtensions.isNullOrUndefinedOrWhiteSpaceString(this.settings.externalLink.url)) {
                this.host.launchUrl(this.settings.externalLink.url);
            }
        });
    }
/*
    private addContextMenu(options: VisualUpdateOptions){
        let rootSVGElement = this.advanceCard.getRootElement();
        let selectionId = this.host.createSelectionIdBuilder()
            .withMeasure(options.dataViews[0].table.columns[0].queryName)
            .createSelectionId();
        let tooltipData = this.advanceCardData.getTooltipData();
        rootSVGElement.on("mousemove", (e) => {
            if (tooltipData) {
                const mouseX = mouse(<any>rootSVGElement.node())[0];
                const mouseY = mouse(<any>rootSVGElement.node())[1];
                this.host.tooltipService.show({
                    "dataItems": tooltipData,
                    "identities": [selectionId],
                    "coordinates": [mouseX, mouseY],
                    "isTouchEvent": true
                });
            }
        });

        rootSVGElement.on("contextmenu", () => {
            const mouseEvent: MouseEvent = <MouseEvent>d3event;
            this.selectionManager.showContextMenu(selectionId, {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY
            });
            mouseEvent.preventDefault();
        });
    }
    */

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        const settings: VisualObjectInstance[] = [], conditionKey = "condition", valueKey = "value", foregroundColorKey = "foregroundColor", backgroundColorKey = "backgroundColor";
        switch (options.objectName) {
            case "general":
                settings.push({
                    "objectName": options.objectName,
                    "properties": { "alignmentSpacing": this.settings.general.alignmentSpacing, "alignment": this.settings.general.alignment },
                    "selector": null
                });
                break;
            case "conditionSettings":
                settings.push({
                    "objectName": options.objectName,
                    "properties": {
                        "show": this.settings.conditionSettings.show,
                        "conditionNumbers": this.settings.conditionSettings.conditionNumbers,
                        "applyToDataLabel": this.settings.conditionSettings.applyToDataLabel,
                        "applyToCategoryLabel": this.settings.conditionSettings.applyToCategoryLabel,
                        "applyToPrefix": this.settings.conditionSettings.applyToPrefix,
                        "applyToPostfix": this.settings.conditionSettings.applyToPostfix
                    },
                    "selector": null
                });
                for (let index = 1; index <= this.settings.conditionSettings.conditionNumbers; index++) {
                    settings.push({
                        "objectName": options.objectName,
                        "properties": {
                            [conditionKey + index]: this.settings.conditionSettings["condition" + index],
                            [valueKey + index]: this.settings.conditionSettings["value" + index],
                            [foregroundColorKey + index]: this.settings.conditionSettings["foregroundColor" + index],
                            [backgroundColorKey + index]: this.settings.conditionSettings["backgroundColor" + index]
                        }, "selector": null
                    });
                }
                break;
            case "tootlipSettings":
                settings.push({
                    "objectName": options.objectName,
                    "properties": { "title": this.settings.tootlipSettings.title, "content": this.settings.tootlipSettings.content }, "selector": null
                });
                this.tableData.columns.forEach((column) => {
                    if (column.roles.tooltipMeasures === true) {
                        if (column.type.numeric || column.type.integer) {
                            settings.push({
                                "objectName": options.objectName,
                                "displayName": column.displayName + " Display Unit",
                                "properties": { "measureFormat": this.getPropertyValue<number>(column.objects, options.objectName, "measureFormat", 0) },
                                "selector": { "metadata": column.queryName }
                            });
                            settings.push({
                                "objectName": options.objectName,
                                "displayName": column.displayName + " Precision",
                                "properties": { "measurePrecision": this.getPropertyValue<number>(column.objects, options.objectName, "measurePrecision", 0) },
                                "selector": { "metadata": column.queryName }
                            });
                        }
                    }
                });
                break;
            case "backgroundSettings":
                if (this.settings.backgroundSettings.showImage === true) {
                    settings.push({
                        "objectName": options.objectName,
                        "displayName": "Fill",
                        "properties": {
                            "show": this.settings.backgroundSettings.show,
                            "backgroundColor": this.settings.backgroundSettings.backgroundColor,
                            "showImage": this.settings.backgroundSettings.showImage,
                            "imageURL": this.settings.backgroundSettings.imageURL,
                            "imagePadding": this.settings.backgroundSettings.imagePadding,
                            "transparency": this.settings.backgroundSettings.transparency
                        }, "selector": null
                    });
                } else {
                    settings.push({
                        "objectName": options.objectName,
                        "displayName": "Fill",
                        "properties": {
                            "show": this.settings.backgroundSettings.show,
                            "backgroundColor": this.settings.backgroundSettings.backgroundColor,
                            "showImage": this.settings.backgroundSettings.showImage,
                            "transparency": this.settings.backgroundSettings.transparency
                        }, "selector": null
                    });
                }
            default:
                break;
        }
        if (settings.length > 0) { return settings; }
        else { return <VisualObjectInstanceEnumerationObject>AdvanceCardVisualSettings.enumerateObjectInstances(this.settings, options); }
    }

    public getPropertyValue<T>(objects: powerbiVisualsApi.DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            const object = objects[objectName];
            if (object) {
                const property: T = <T> object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }
        return defaultValue;
    }

    private parseSettings(dataView: DataView): AdvanceCardVisualSettings {
        return AdvanceCardVisualSettings.parse(dataView);
    }

    
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        // Building data card, We are going to add two formatting groups "Font Control Group" and "Data Design Group"
        let dataCard: powerbi.visuals.FormattingCard = {
            description: "Data Card Description",
            displayName: "Data field",
            uid: "dataCard_uid",
            groups: []
        }

        // Building formatting group "Font Control Group"
        // Notice that "descriptor" objectName and propertyName should match capabilities object and property names
        let group1_dataFont: powerbi.visuals.FormattingGroup = {
            displayName: "Font Control Group",
            uid: "dataCard_fontControl_group_uid",
            slices: [
                {
                    uid: "dataCard_fontControl_displayUnits_uid",
                    displayName:"display units",
                    control: {
                        type: powerbi.visuals.FormattingComponent.Dropdown,
                        properties: {
                            descriptor: {
                                objectName: "dataLabelSettings",
                                propertyName:"displayUnit"
                            },
                            value: this.settings.dataLabelSettings.displayUnit
                        }
                    }
                },
                // FontControl slice is composite slice, It means it contain multiple properties inside it
                {
                    uid: "data_font_control_slice_uid",
                    displayName: "Font",
                    control: {
                        type: powerbi.visuals.FormattingComponent.FontControl,
                        properties: {
                            fontFamily: {
                                descriptor: {
                                    objectName: "dataLabelSettings",
                                    propertyName: "fontFamily"
                                },
                                value: "wf_standard-font, helvetica, arial, sans-serif"
                            },
                            fontSize: {
                                descriptor: {
                                    objectName: "dataLabelSettings",
                                    propertyName: "fontSize"
                                },
                                value: this.settings.dataLabelSettings.fontSize
                            },
                            bold: {
                                descriptor: {
                                    objectName: "dataLabelSettings",
                                    propertyName: "isBold"
                                },
                                value: this.settings.dataLabelSettings.isBold
                            },
                            italic: {
                                descriptor: {
                                    objectName: "dataLabelSettings",
                                    propertyName: "isItalic"
                                },
                                value: this.settings.dataLabelSettings.isItalic
                            },
                            underline: {
                                descriptor: {
                                    objectName: "dataLabelSettings",
                                    propertyName: "isunderline"
                                },
                                value: this.settings.dataLabelSettings.isunderline
                            }
                        }
                    }
                },
                {
                    uid: "dataCard_fontControl_showblankas_uid",
                    displayName:"Show Blank as",
                    control: {
                        type: powerbi.visuals.FormattingComponent.TextInput,
                        properties: {
                            descriptor: {
                                objectName: "dataLabelSettings",
                                propertyName:"text"
                            },
                            placeholder:"Title Text",
                            value: this.settings.dataLabelSettings.text
                        }
                    }
                }
            ],
        };
        // Building formatting group "Font Control Group"
        // Notice that "descriptor" objectName and propertyName should match capabilities object and property names
        let group2_dataDesign: powerbi.visuals.FormattingGroup = {
            displayName: "Data Design Group",
            uid: "dataCard_dataDesign_group_uid",
            slices: [
                // Adding ColorPicker simple slice for font color
                {
                    displayName: "Font Color",
                    uid: "dataCard_dataDesign_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "dataLabelSettings",
                                propertyName: "color"
                            },
                            value: { value: this.settings.dataLabelSettings.color }
                        }
                    }
                },
                // Adding AlignmentGroup simple slice for line alignment
                {
                    displayName: "Line Alignment",
                    uid: "dataCard_dataDesign_lineAlignment_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.AlignmentGroup,
                        properties: {
                            descriptor:
                            {
                                objectName: "dataLabelSettings",
                                propertyName: "lineAlignment"
                            },
                            mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
                            value: "left"
                        }
                    }
                },
            ]
        };

        // Add formatting groups to data card
        dataCard.groups.push(group1_dataFont);
        dataCard.groups.push(group2_dataDesign);

        let dataCard1: powerbi.visuals.FormattingCard = {
            description: "Data Card Description",
            displayName: "Period counter",
            uid: "dataCard1_uid",
            groups: []
        }

        // Building formatting group "Font Control Group"
        // Notice that "descriptor" objectName and propertyName should match capabilities object and property names
        let group11_dataFont: powerbi.visuals.FormattingGroup = {
            displayName: "Font Control Group",
            uid: "dataCard1_fontControl_group_uid",
            slices: [
                {
                    uid: "dataCard1_fontControl_displayUnits_uid",
                    displayName:"display units",
                    control: {
                        type: powerbi.visuals.FormattingComponent.Dropdown,
                        properties: {
                            descriptor: {
                                objectName: "prefixSettings",
                                propertyName:"displayUnit"
                            },
                            value: this.settings.prefixSettings.displayUnit
                        }
                    }
                },
                // FontControl slice is composite slice, It means it contain multiple properties inside it
                {
                    uid: "data1_font_control_slice_uid",
                    displayName: "Font",
                    control: {
                        type: powerbi.visuals.FormattingComponent.FontControl,
                        properties: {
                            fontFamily: {
                                descriptor: {
                                    objectName: "prefixSettings",
                                    propertyName: "fontFamily"
                                },
                                value: "wf_standard-font, helvetica, arial, sans-serif"
                            },
                            fontSize: {
                                descriptor: {
                                    objectName: "prefixSettings",
                                    propertyName: "fontSize"
                                },
                                value: this.settings.prefixSettings.fontSize
                            },
                            bold: {
                                descriptor: {
                                    objectName: "prefixSettings",
                                    propertyName: "isBold"
                                },
                                value: this.settings.prefixSettings.isBold
                            },
                            italic: {
                                descriptor: {
                                    objectName: "prefixSettings",
                                    propertyName: "isItalic"
                                },
                                value: this.settings.prefixSettings.isItalic
                            },
                            underline: {
                                descriptor: {
                                    objectName: "prefixSettings",
                                    propertyName: "isunderline"
                                },
                                value: this.settings.prefixSettings.isunderline
                            }
                        }
                    }
                }
            ],
        };
        // Building formatting group "Font Control Group"
        // Notice that "descriptor" objectName and propertyName should match capabilities object and property names
        let group21_dataDesign: powerbi.visuals.FormattingGroup = {
            displayName: "Data Design Group",
            uid: "dataCard1_dataDesign_group_uid",
            slices: [
                // Adding ColorPicker simple slice for font color
                {
                    displayName: "Font Color",
                    uid: "dataCard1_dataDesign_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "prefixSettings",
                                propertyName: "color"
                            },
                            value: { value: this.settings.prefixSettings.color }
                        }
                    }
                },
                // Adding AlignmentGroup simple slice for line alignment
                {
                    displayName: "Line Alignment",
                    uid: "dataCard1_dataDesign_lineAlignment_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.AlignmentGroup,
                        properties: {
                            descriptor:
                            {
                                objectName: "prefixSettings",
                                propertyName: "lineAlignment"
                            },
                            mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
                            value: "left"
                        }
                    }
                },
            ]
        };

        // Add formatting groups to data card
        dataCard1.groups.push(group11_dataFont);
        dataCard1.groups.push(group21_dataDesign);

        let dataCard2: powerbi.visuals.FormattingCard = {
            description: "Data Card Description",
            displayName: "Change Value",
            uid: "dataCard2_uid",
            groups: []
        }

        // Building formatting group "Font Control Group"
        // Notice that "descriptor" objectName and propertyName should match capabilities object and property names
        let group12_dataFont: powerbi.visuals.FormattingGroup = {
            displayName: "Font Control Group",
            uid: "dataCard1_fontControl_group_uid",
            slices: [
                {
                    uid: "dataCard2_fontControl_displayUnits_uid",
                    displayName:"display units",
                    control: {
                        type: powerbi.visuals.FormattingComponent.Dropdown,
                        properties: {
                            descriptor: {
                                objectName: "postfixSettings",
                                propertyName:"displayUnit"
                            },
                            value: this.settings.postfixSettings.displayUnit
                        }
                    }
                },
                // FontControl slice is composite slice, It means it contain multiple properties inside it
                {
                    uid: "data_font_control_slice_uid",
                    displayName: "Font",
                    control: {
                        type: powerbi.visuals.FormattingComponent.FontControl,
                        properties: {
                            fontFamily: {
                                descriptor: {
                                    objectName: "postfixSettings",
                                    propertyName: "fontFamily"
                                },
                                value: "wf_standard-font, helvetica, arial, sans-serif"
                            },
                            fontSize: {
                                descriptor: {
                                    objectName: "postfixSettings",
                                    propertyName: "fontSize"
                                },
                                value: this.settings.postfixSettings.fontSize
                            },
                            bold: {
                                descriptor: {
                                    objectName: "postfixSettings",
                                    propertyName: "isBold"
                                },
                                value: this.settings.postfixSettings.isBold
                            },
                            italic: {
                                descriptor: {
                                    objectName: "postfixSettings",
                                    propertyName: "isItalic"
                                },
                                value: this.settings.postfixSettings.isItalic
                            },
                            underline: {
                                descriptor: {
                                    objectName: "postfixSettings",
                                    propertyName: "isunderline"
                                },
                                value: this.settings.postfixSettings.isunderline
                            }
                        }
                    }
                }
            ],
        };
        // Building formatting group "Font Control Group"
        // Notice that "descriptor" objectName and propertyName should match capabilities object and property names
        let group22_dataDesign: powerbi.visuals.FormattingGroup = {
            displayName: "Data Design Group",
            uid: "dataCard2_dataDesign_group_uid",
            slices: [
                // Adding ColorPicker simple slice for font color
                {
                    displayName: "Negative",
                    uid: "dataCard2_dataDesign_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "postfixSettings",
                                propertyName: "color_negative"
                            },
                            value: { value: this.settings.postfixSettings.color_negative }
                        }
                    }
                },
                {
                    displayName: "Neutral",
                    uid: "dataCard2_dataDesign_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "postfixSettings",
                                propertyName: "color_neutral"
                            },
                            value: { value: this.settings.postfixSettings.color_neutral }
                        }
                    }
                },
                {
                    displayName: "Postive",
                    uid: "dataCard2_dataDesign_fontColor_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.ColorPicker,
                        properties: {
                            descriptor:
                            {
                                objectName: "postfixSettings",
                                propertyName: "color_postivie"
                            },
                            value: { value: this.settings.postfixSettings.color_positive }
                        }
                    }
                },
                // Adding AlignmentGroup simple slice for line alignment
                {
                    displayName: "Line Alignment",
                    uid: "dataCard2_dataDesign_lineAlignment_slice",
                    control: {
                        type: powerbi.visuals.FormattingComponent.AlignmentGroup,
                        properties: {
                            descriptor:
                            {
                                objectName: "postfixSettings",
                                propertyName: "lineAlignment"
                            },
                            mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
                            value: "left"
                        }
                    }
                },
            ]
        };

        // Add formatting groups to data card
        dataCard2.groups.push(group12_dataFont);
        dataCard2.groups.push(group22_dataDesign);


        
        // Build and return formatting model with data card
        const formattingModel: powerbi.visuals.FormattingModel = { cards: [dataCard,dataCard1,dataCard2] };
        return formattingModel;
    }
}