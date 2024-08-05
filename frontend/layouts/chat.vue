<template>
  <div class="grid mx-auto xs:p-8 w-full h-[100dvh] max-w-md grid-cols-1 grid-rows-1 place-items-center">
    <div class="grid py-4 h-full max-h-[800px] grid-cols-1 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden xs:rounded-3xl xs:shadow-xl bg-white">
      <div class="grid grid-cols-3 items-start">
        <div class="flex px-4 items-center justify-start gap-4">
          <slot name="header-button-left" />
        </div>
        <slot name="header-center">
          <div></div>
        </slot>
        <div class="flex px-4 items-center justify-end gap-4">
          <slot name="header-button-right" />
        </div>
      </div>
      <slot name="content">
        <div></div>
      </slot>
      <slot name="footer">
        <div></div>
      </slot>
    </div>
  </div>
</template>