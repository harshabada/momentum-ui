import "@/components/datepicker/datepicker-month/DatePickerMonth";
import "@/components/icon/Icon";
import {
  addDays,
  addMonths,
  DatePickerProps,
  DayFilters,
  getLocaleData,
  getStartOfWeek,
  getWeekdayNameInLocale,
  localizeDate,
  now,
  shouldNextMonthDisable,
  shouldPrevMonthDisable,
  subtractMonths
} from "@/utils/dateUtils";
import reset from "@/wc_scss/reset.scss";
import {
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  PropertyValues,
  TemplateResult
} from "lit-element";
import { ifDefined } from "lit-html/directives/if-defined";
import { DateTime } from "luxon";
import styles from "../scss/module.scss";

export namespace DatePickerCalendar {}

@customElement("md-datepicker-calendar")
export class DatePickerCalendar extends LitElement {
  @property({ attribute: false }) locale = "en";
  @property({ attribute: false }) monthFormat = "MMMM yyyy";
  @property({ attribute: false }) monthNavFocus = "prev";
  @property({ attribute: false }) nextArialLabel = undefined;
  @property({ attribute: false }) previousArialLabel = undefined;
  @property({ attribute: false }) filterParams: DayFilters | undefined = undefined;
  @property({ attribute: false }) handleMonthChange: Function | undefined = undefined;
  @property({ attribute: false }) datePickerProps: DatePickerProps | undefined = undefined;

  @internalProperty() viewAnchorDate: DateTime = now();

  connectedCallback() {
    super.connectedCallback();
    this.viewAnchorDate = this.datePickerProps?.focused || this.datePickerProps?.selected || now();
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    console.log("cal updated");
    // this.datePickerProps = { selected: this.selected, focused: this.focused };
    // REFACTOR:  if the focused date changes, update the set date to the focused date
    // REACT VERSION:
    // const { focused, monthNavFocus } = changedProperties;
    // if (this.focused && !isSameDay(this.focused, this.viewAnchorDate)) {
    //   this.setDate(this.focused);
    // }

    // REFACTOR: Not clear, seems to set focus to the month nav buttons based upon a property
    // if (monthNavFocus !== this.monthNavFocus) {
    //   this.monthNavFocus === "prev" && this.prevMonthRef.button.focus();
    //   this.monthNavFocus === "next" && this.nextMonthRef.button.focus();
    // }
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    console.log("cal update");
  }

  // handleDaySelect = (e: CustomEvent) => {
  //   this.selected = e.detail.date;
  //   this.datePickerProps = { selected: this.selected, focused: this.focused };
  // };

  setDate = (date: DateTime, cb?: Function) => {
    this.viewAnchorDate = date;
    cb && cb();
  };

  increaseMonth = (event: MouseEvent) => {
    const { handleMonthChange } = this;
    const { viewAnchorDate: date } = this;
    this.setDate(addMonths(date, 1), () => handleMonthChange && handleMonthChange(event, this.viewAnchorDate));
  };

  decreaseMonth = (event: MouseEvent) => {
    const { handleMonthChange } = this;
    const { viewAnchorDate: date } = this;
    this.setDate(subtractMonths(date, 1), () => handleMonthChange && handleMonthChange(event, this.viewAnchorDate));
  };

  renderMonthName = () => {
    return html`
      <div class="md-datepicker__navigation--current-month">
        ${localizeDate(this.viewAnchorDate, this.locale).toFormat(this.monthFormat)}
      </div>
    `;
  };

  renderPreviousMonthButton = () => {
    const allPrevDaysDisabled =
      this.filterParams?.minDate && shouldPrevMonthDisable(this.viewAnchorDate, this.filterParams?.minDate);
    return html`
      <md-button
        aria-label=${ifDefined(
          !this.previousArialLabel
            ? `previous month, ${subtractMonths(this.viewAnchorDate, 1).toFormat("MMMM")}`
            : this.previousArialLabel
        )}
        ?disabled=${allPrevDaysDisabled}
        @click=${!allPrevDaysDisabled && this.decreaseMonth}
        tabindex="-1"
        hasRemoveStyle
      >
        <md-icon name="arrow-left_16"></md-icon>
      </md-button>
    `;
  };
  renderNextMonthButton = () => {
    const allNextDaysDisabled =
      this.filterParams?.maxDate && shouldNextMonthDisable(this.viewAnchorDate, this.filterParams?.maxDate);
    return html`
      <md-button
        aria-label=${ifDefined(
          !this.nextArialLabel
            ? `next month, ${addMonths(this.viewAnchorDate, 1).toFormat("MMMM")}`
            : this.nextArialLabel
        )}
        ?disabled=${allNextDaysDisabled}
        @click=${!allNextDaysDisabled && this.increaseMonth}
        tabindex="-1"
        hasRemoveStyle
        ><md-icon name="arrow-right_16"></md-icon>
      </md-button>
    `;
  };

  header = () => {
    const startOfWeek = getStartOfWeek(this.viewAnchorDate);
    const dayNames: TemplateResult[] = [];
    return dayNames.concat(
      [0, 1, 2, 3, 4, 5, 6].map(offset => {
        const day = addDays(localizeDate(startOfWeek, this.locale), offset);
        const localeData = getLocaleData(day);
        const weekDayName = getWeekdayNameInLocale(localeData, day);
        return html`
          <div class="md-datepicker__day--name">
            ${weekDayName}
          </div>
        `;
      })
    );
  };

  renderMonth = () => {
    return html`
      <div class="md-datepicker__month-container">
        <div class="md-datepicker__header">
          <div class="md-datepicker__navigation">
            ${this.renderMonthName()}
            <div class="md-datepicker__navigation--buttons">
              ${this.renderPreviousMonthButton()} ${this.renderNextMonthButton()}
            </div>
          </div>
          <div class="md-datepicker__day--names">
            ${this.header()}
          </div>
        </div>
        <md-datepicker-month
          .day=${this.viewAnchorDate}
          .filterParams=${this.filterParams}
          .datePickerProps=${this.datePickerProps}
        ></md-datepicker-month>
      </div>
    `;
  };

  static get styles() {
    return [reset, styles];
  }

  render() {
    return html`
      <div class="md-datepicker__calendar">
        ${this.viewAnchorDate && this.renderMonth()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-datepicker-calendar": DatePickerCalendar;
  }
}