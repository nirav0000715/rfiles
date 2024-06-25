/*
 *  Power BI Visualizations
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

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { ILabelTextProperties } from "./AdvanceCardUtils";
import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

export class AdvanceCardVisualSettings extends DataViewObjectsParser {
    public prefixSettings = new PreFixLabelSettings();
    public postfixSettings = new PostFixLabelSettings();
    public dataLabelSettings = new DataLabelSettings();
    public categoryLabelSettings = new CategoryLabelSettings();
    public backgroundSettings = new FillSettings();
    public strokeSettings = new StrokeSettings();
    public conditionSettings = new ConditionSettings();
    public tootlipSettings = new TooltipSettings();
    public aboutSettings = new AboutSettings();
    public general = new GeneralSettings();
    public externalLink = new ExternalLink();
}

export class PostFixLabelSettings implements ILabelTextProperties {
    public show: boolean = true;
    public text: string = null;
    public color: string = "#000000"
    public color_negative: string = "#F25022";
    public color_neutral: string = "#000000";
    public color_positive: string = "#7FBA00";
    public spacing: number = 4;
    public fontSize: number = 12;
    public fontFamily: string = "wf_standard-font, helvetica, arial, sans-serif";
    public isBold: boolean = false;
    public isItalic: boolean = false;
    public isunderline: boolean = false;
    public lineAlignment: string = "left";
    public displayUnit: number = 0;
    public decimalPlaces: number = 0;
}

export class PreFixLabelSettings implements ILabelTextProperties {
    public show: boolean = true;
    public text: string = null;
    public color: string = "#333333";
    public color_negative: string = "#F25022";
    public color_neutral: string = "#000000";
    public color_positive: string = "#7FBA00";
    public spacing: number = 4;
    public fontSize: number = 12;
    public fontFamily: string = "wf_standard-font, helvetica, arial, sans-serif";
    public isBold: boolean = false;
    public isItalic: boolean = false;
    public isunderline: boolean = false;
    public lineAlignment: string = "left";
    public displayUnit: number = 0;
    public decimalPlaces: number = 0;
}

export class DataLabelSettings implements ILabelTextProperties {
    public text: string = "0"
    public color: string = "#00FF00";
    public color_negative: string = "#F25022";
    public color_neutral: string = "#000000";
    public color_positive: string = "#7FBA00";
    public displayUnit: number = 0;
    public decimalPlaces: number = 0;
    public fontSize: number = 20;
    public fontFamily: string = "wf_standard-font, helvetica, arial, sans-serif";
    public isBold: boolean = false;
    public isItalic: boolean = false;
    public isunderline: boolean = false;
    public wordWrap: boolean = true;
    public lineAlignment: string = "left";
}

export class CategoryLabelSettings implements ILabelTextProperties {
    public text: string = null;
    public show: boolean = false;
    public color: string = "#a6a6a6";
    public color_negative: string = "#F25022";
    public color_neutral: string = "#000000";
    public color_positive: string = "#7FBA00";
    public fontSize: number = 12;
    public fontFamily: string = "\"Segoe UI\", wf_segoe-ui_normal, helvetica, arial, sans-serif";
    public isBold: boolean = false;
    public isItalic: boolean = false;
    public isunderline: boolean = false;
    
}

export class FillSettings {
    public show: boolean = false;
    public backgroundColor: string = "#FEA19E";
    public showImage: boolean = false;
    public imageURL: string = null;
    public imagePadding: number = 0;
    public transparency: number = 0;
}

export class StrokeSettings {
    // default stroke type numbers
    // 0: solid
    // 1: dashed
    // 2: dotted
    public show: boolean = false;
    public strokeColor: string = "#666666";
    public strokeWidth: number = 2;
    public strokeType: string = "0";
    public strokeLineCap: string = "butt";
    public strokeArray: string = null;
    public cornerRadius: number = 15;
    public topLeft: boolean = false;
    public topRight: boolean = false;
    public bottomLeft: boolean = false;
    public bottomRight: boolean = false;
    public topLeftInward: boolean = false;
    public topRightInward: boolean = false;
    public bottomLeftInward: boolean = false;
    public bottomRightInward: boolean = false;
}

export class ConditionSettings {
    public show: boolean = false;
    public conditionNumbers: number = 3;
    public applyToDataLabel: boolean = false;
    public applyToCategoryLabel: boolean = false;
    public applyToPrefix: boolean = false;
    public applyToPostfix: boolean = true;

    public condition1: string = ">";
    public value1: number = 0;
    public foregroundColor1: string = "#00FF00";
    public backgroundColor1: string = null;

    public condition2: string = "<";
    public value2: number = 0;
    public foregroundColor2: string = "#FF0000";
    public backgroundColor2: string = null;

    public condition3: string = "=";
    public value3: number = 0;
    public foregroundColor3: string = "#000000";
    public backgroundColor3: string = null;

    public condition4: string = ">";
    public value4: number = null;
    public foregroundColor4: string = null;
    public backgroundColor4: string = null;

    public condition5: string = ">";
    public value5: number = null;
    public foregroundColor5: string = null;
    public backgroundColor5: string = null;

    public condition6: string = ">";
    public value6: number = null;
    public foregroundColor6: string = null;
    public backgroundColor6: string = null;

    public condition7: string = ">";
    public value7: number = null;
    public foregroundColor7: string = null;
    public backgroundColor7: string = null;

    public condition8: string = ">";
    public value8: number = null;
    public foregroundColor8: string = null;
    public backgroundColor8: string = null;

    public condition9: string = ">";
    public value9: number = null;
    public foregroundColor9: string = null;
    public backgroundColor9: string = null;

    public condition10: string = ">";
    public value10: number = null;
    public foregroundColor10: string = null;
    public backgroundColor10: string = null;
}

export class TooltipSettings {
    public title: string = null;
    public content: string = null;
    public measureFormat: number = 0;
    public measurePrecision: number = 0;
}

export class AboutSettings {
    public version: string = "";
    public helpUrl: string = "";
}

export class GeneralSettings {
    public alignment: string = "left";
    public alignmentSpacing: number = 0;
}

export class ExternalLink {
    public show: boolean = false;
    public url: string = "";
}