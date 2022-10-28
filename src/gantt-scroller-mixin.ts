import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { query } from 'lit-element/decorators.js';
import { GanttElement } from './gantt-element';

type Constructor<T = object> = {
    new(...args: any[]): T;
    prototype: T;
};

export interface GanttScrollerInterface {
    _container: HTMLDivElement;
    registerScrollElement(scrollElement: HTMLElement): void;
}

export const GanttScrollerMixin = <T extends Constructor<LitElement>>(
    base: T
): T & Constructor<GanttScrollerInterface> => {
    class GanttScrollerMixin extends base implements GanttScrollerInterface {

        @query('#container') _container: HTMLDivElement;

        _scrollElement: HTMLElement;
        _handleScrollElementScroll: (this: HTMLElement, ev: Event) => any;
        _handleContainerScroll: (this: HTMLElement, ev: Event) => any;
        _skipScrollElementScroll: boolean;
        _skipContainerScroll: boolean;

        /**
         * Register additional scroll event handler to the given element. scrollTop from gantt container will be delegated
         * to the given element and vice versa.
         * @param scrollElement Any scrollable element with scrollTop property or null to clear scroll element.
         */
        public registerScrollElement(scrollElement: HTMLElement): void {
            if (!scrollElement) { 
                if(this._scrollElement) {
                    this._scrollElement.removeEventListener('scroll', this._handleScrollElementScroll);
                    this._container.removeEventListener('scroll', this._handleContainerScroll);
                }
                this._scrollElement = scrollElement;
                return;
            }
            this._scrollElement = scrollElement;
            this.updateComplete.then(() => {
                let self = this;
                let container = this._container;
                this._skipScrollElementScroll = false;
                this._skipContainerScroll = false;
                this._handleScrollElementScroll = () => self._onHandleScrollElementScroll(self);
                this._handleContainerScroll = () => self._onHandleContainerScroll(self);
                scrollElement.addEventListener('scroll', self._handleScrollElementScroll);
                container.addEventListener('scroll', self._handleContainerScroll);
            });
        }

        _onHandleScrollElementScroll(ganttElement: GanttScrollerMixin) {
            if(ganttElement._skipScrollElementScroll) {
                return;
            }
            if(ganttElement._scrollElement.scrollTop == ganttElement._container.scrollTop) {
                return;
            }
            requestAnimationFrame(() => {
                if(ganttElement._skipScrollElementScroll) {
                    return;
                }
                ganttElement._skipContainerScroll = true;
                ganttElement._container.scrollTop = ganttElement._scrollElement.scrollTop > 0 ? ganttElement._scrollElement.scrollTop : 0;
                ganttElement._skipContainerScroll = false;
            });
        }

        _onHandleContainerScroll(ganttElement: GanttScrollerMixin) {
            if(ganttElement._skipContainerScroll) {
                return;
            }
            if(ganttElement._scrollElement.scrollTop == ganttElement._container.scrollTop) {
                return;
            }
            requestAnimationFrame(() => {
                if(ganttElement._skipContainerScroll) {
                    return;
                }
                ganttElement._skipScrollElementScroll = true;
                ganttElement._scrollElement.scrollTop = ganttElement._container.scrollTop > 0 ? ganttElement._container.scrollTop : 0;
                ganttElement._skipScrollElementScroll = false;
            });
        }

        disconnectedCallback() {
            super.disconnectedCallback();
            let self = this;
            this._scrollElement.removeEventListener('scroll', self._handleScrollElementScroll);
            this._container.removeEventListener('scroll', self._handleContainerScroll);
          }
   
    }
    return GanttScrollerMixin;
};