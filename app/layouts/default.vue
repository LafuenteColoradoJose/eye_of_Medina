<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex flex-row flex-1">
      <Nav />
      <main class="flex-1 overflow-auto">
        <Transition name="page" mode="out-in">
          <slot />
        </Transition>
      </main>
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>