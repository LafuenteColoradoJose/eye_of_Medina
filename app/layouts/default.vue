<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex flex-col md:flex-row flex-1">
      <Nav />
      <main class="flex-1 overflow-auto items-center">
        <Transition name="page" mode="out-in">
          <slot />
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped></style>