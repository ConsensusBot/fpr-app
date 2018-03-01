'use strict';

/**
 * Module dependencies
 */

// N/A


/**
 * <ajax-button>
 *
 * @type {Component}
 */

parasails.registerComponent('ajaxButton', {

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠╣ ╠═╣║  ║╣
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╚  ╩ ╩╚═╝╚═╝
  props: ['syncing'],

  //  ╔╦╗╔═╗╦═╗╦╔═╦ ╦╔═╗
  //  ║║║╠═╣╠╦╝╠╩╗║ ║╠═╝
  //  ╩ ╩╩ ╩╩╚═╩ ╩╚═╝╩
  template: '\n  <button type="submit" class="btn ajax-button" :class="[syncing ? \'syncing\' : \'\']">\n    <span class="button-text" v-if="!syncing"><slot name="default">Submit</slot></span>\n    <span class="button-loader clearfix" v-if="syncing">\n      <slot name="syncing-state">\n        <div>Saving...</div>\n      </slot>\n    </span>\n  </button>\n  ',

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {};
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {},

  mounted: function mounted() {

    // Log a warning if we're not inside of an <ajax-form>
    var $closestAncestralForm = this.$get().closest('form');
    if ($closestAncestralForm.length === 0) {
      console.warn('Hmm... this <ajax-button> doesn\'t seem to be part of an <ajax-form>...');
    }
  },

  beforeDestroy: function beforeDestroy() {},

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {}

});
