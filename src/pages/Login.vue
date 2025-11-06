<template>
  <div class="auth-bg d-flex align-items-center justify-content-center">
    <!-- blobs decorativos -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="card shadow-sm border-0 auth-card">
      <div class="card-body p-4 p-md-5">

        <!-- Logo + título -->
        <div class="text-center mb-3">
          <div class="rounded-circle bg-primary-subtle d-inline-flex align-items-center justify-content-center" style="width:56px;height:56px;">
            <span class="text-primary fw-bold fs-5">O</span>
          </div>
          <h1 class="h4 text-primary mt-2 mb-0">Orbiter</h1>
        </div>

        <hr class="text-body-secondary opacity-25"/>

        <h2 class="h5 text-center mb-4">Log in !</h2>

        <!-- FORM -->
        <form @submit.prevent="onSubmit" novalidate>
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model.trim="form.username" type="text" class="form-control" placeholder="Enter Username here" required />
          </div>

          <div class="mb-2">
            <label class="form-label">Password</label>
            <div class="input-group">
              <input :type="showPass ? 'text' : 'password'"
                     v-model.trim="form.password"
                     class="form-control" placeholder="Enter Password here" required minlength="6" />
              <button type="button" class="btn btn-outline-secondary" @click="showPass = !showPass" title="Show/Hide">
                <i :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember" v-model="remember">
              <label class="form-check-label" for="remember">Remember Me</label>
            </div>
            <RouterLink to="/forgot-password" class="link-primary small">Forgot Password?</RouterLink>
          </div>

          <button class="btn btn-brand btn-lg w-100" type="submit" :disabled="loading">
            <span v-if="!loading">Log in</span>
            <span v-else class="d-inline-flex align-items-center gap-2">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Loading...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="text-center my-4 d-flex align-items-center">
          <hr class="flex-grow-1"/>
          <span class="mx-3 text-secondary">OR</span>
          <hr class="flex-grow-1"/>
        </div>

        <!-- Social -->
        <div class="row g-2">
          <div class="col-6">
            <button class="btn btn-light border w-100">
              <i class="bi bi-facebook text-primary me-2"></i> Facebook
            </button>
          </div>
          <div class="col-6">
            <button class="btn btn-light border w-100">
              <i class="bi bi-google text-danger me-2"></i> Google
            </button>
          </div>
        </div>

        <p class="text-center mt-4 text-secondary">
          Don't have an account?
          <RouterLink to="/sign-up" class="link-primary">Sign up</RouterLink>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const showPass = ref(false)
const remember = ref(false)
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const onSubmit = async () => {
  if (!form.value.username || !form.value.password) return
  loading.value = true
  try {
    // Ajusta la URL a tu backend (Laravel /api/login o lo que uses)
    const { data } = await axios.post('/api/login', {
      username: form.value.username,
      password: form.value.password,
      remember: remember.value
    })
    // TODO: guarda token/usuario en Pinia/localStorage
    // localStorage.setItem('token', data.token)
    router.push('/')
  } catch (err) {
    console.error(err)
    alert('Credenciales inválidas o error del servidor')
  } finally {
    loading.value = false
  }
}
</script>
