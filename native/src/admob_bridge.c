#include "admob_bridge.h"

#include <string.h>

#include <quickjs.h>
#include <SDL3/SDL.h>
#include <SDL3/SDL_system.h>

#include "engine.h"
#include "js_sdl3.h"

#ifdef __ANDROID__
#include <jni.h>
#endif

static JSValue reward_promise_resolve = JS_UNDEFINED;
static SDL_AtomicInt reward_result;
static JSValue play_games_promise_resolve = JS_UNDEFINED;
static SDL_AtomicInt play_games_result;
static char *play_games_auth_code;
static SDL_Mutex *play_games_mutex;

static void declare_exports(JSContext *ctx, JSModuleDef *module)
{
    (void)ctx;
    JS_AddModuleExport(ctx, module, "showRewardedAd");
    JS_AddModuleExport(ctx, module, "requestPlayGamesServerAuthCode");
}

static JSValue show_rewarded_ad(JSContext *ctx, JSValueConst this_value, int argc, JSValueConst *argv)
{
    (void)this_value;
    (void)argc;
    (void)argv;

    JSValue functions[2];
    JSValue promise = JS_NewPromiseCapability(ctx, functions);
    if (JS_IsException(promise)) return promise;

    if (!JS_IsUndefined(reward_promise_resolve)) {
        JSValue value = JS_FALSE;
        JSValue result = JS_Call(ctx, functions[0], JS_UNDEFINED, 1, &value);
        JS_FreeValue(ctx, result);
        JS_FreeValue(ctx, functions[0]);
        JS_FreeValue(ctx, functions[1]);
        return promise;
    }

    reward_promise_resolve = functions[0];
    JS_FreeValue(ctx, functions[1]);
    SDL_SetAtomicInt(&reward_result, 0);

#ifdef __ANDROID__
    JNIEnv *env = (JNIEnv *)SDL_GetAndroidJNIEnv();
    jobject activity = (jobject)SDL_GetAndroidActivity();
    if (env && activity) {
        jclass activity_class = (*env)->GetObjectClass(env, activity);
        jmethodID method = activity_class
            ? (*env)->GetMethodID(env, activity_class, "showRewardedAd", "()V")
            : NULL;
        if (method) {
            (*env)->CallVoidMethod(env, activity, method);
        } else {
            SDL_SetAtomicInt(&reward_result, 2);
        }
        if (activity_class) (*env)->DeleteLocalRef(env, activity_class);
        if ((*env)->ExceptionCheck(env)) {
            (*env)->ExceptionClear(env);
            SDL_SetAtomicInt(&reward_result, 2);
        }
    } else {
        SDL_SetAtomicInt(&reward_result, 2);
    }
#else
    SDL_SetAtomicInt(&reward_result, 2);
#endif

    return promise;
}

static JSValue request_play_games_server_auth_code(
    JSContext *ctx, JSValueConst this_value, int argc, JSValueConst *argv)
{
    (void)this_value;
    (void)argc;
    (void)argv;

    JSValue functions[2];
    JSValue promise = JS_NewPromiseCapability(ctx, functions);
    if (JS_IsException(promise)) return promise;

    if (!JS_IsUndefined(play_games_promise_resolve)) {
        JSValue result = JS_Call(ctx, functions[0], JS_UNDEFINED, 0, NULL);
        JS_FreeValue(ctx, result);
        JS_FreeValue(ctx, functions[0]);
        JS_FreeValue(ctx, functions[1]);
        return promise;
    }

    play_games_promise_resolve = functions[0];
    JS_FreeValue(ctx, functions[1]);
    SDL_SetAtomicInt(&play_games_result, 0);

#ifdef __ANDROID__
    JNIEnv *env = (JNIEnv *)SDL_GetAndroidJNIEnv();
    jobject activity = (jobject)SDL_GetAndroidActivity();
    if (env && activity) {
        jclass activity_class = (*env)->GetObjectClass(env, activity);
        jmethodID method = activity_class
            ? (*env)->GetMethodID(env, activity_class, "requestPlayGamesServerAuthCode", "()V")
            : NULL;
        if (method) {
            (*env)->CallVoidMethod(env, activity, method);
        } else {
            SDL_SetAtomicInt(&play_games_result, 2);
        }
        if (activity_class) (*env)->DeleteLocalRef(env, activity_class);
        if ((*env)->ExceptionCheck(env)) {
            (*env)->ExceptionClear(env);
            SDL_SetAtomicInt(&play_games_result, 2);
        }
    } else {
        SDL_SetAtomicInt(&play_games_result, 2);
    }
#else
    SDL_SetAtomicInt(&play_games_result, 2);
#endif

    return promise;
}

static int set_exports(JSContext *ctx, JSModuleDef *module)
{
    if (JS_SetModuleExport(ctx, module, "showRewardedAd",
        JS_NewCFunction(ctx, show_rewarded_ad, "showRewardedAd", 0)) < 0) {
        return -1;
    }
    return JS_SetModuleExport(ctx, module, "requestPlayGamesServerAuthCode",
        JS_NewCFunction(ctx, request_play_games_server_auth_code,
            "requestPlayGamesServerAuthCode", 0));
}

static void pump(JSContext *ctx)
{
    int result = SDL_GetAtomicInt(&reward_result);
    if (result != 0 && !JS_IsUndefined(reward_promise_resolve)) {
        SDL_SetAtomicInt(&reward_result, 0);
        JSValue value = JS_NewBool(ctx, result == 1);
        JSValue call_result = JS_Call(ctx, reward_promise_resolve, JS_UNDEFINED, 1, &value);
        JS_FreeValue(ctx, call_result);
        JS_FreeValue(ctx, value);
        JS_FreeValue(ctx, reward_promise_resolve);
        reward_promise_resolve = JS_UNDEFINED;
    }

    int play_games_status = SDL_GetAtomicInt(&play_games_result);
    if (play_games_status != 0 && !JS_IsUndefined(play_games_promise_resolve)) {
        SDL_SetAtomicInt(&play_games_result, 0);
        JSValue value = JS_NULL;
        if (play_games_status == 1 && play_games_mutex) {
            SDL_LockMutex(play_games_mutex);
            if (play_games_auth_code) {
                value = JS_NewString(ctx, play_games_auth_code);
            }
            SDL_free(play_games_auth_code);
            play_games_auth_code = NULL;
            SDL_UnlockMutex(play_games_mutex);
        }
        JSValue call_result = JS_Call(ctx, play_games_promise_resolve, JS_UNDEFINED, 1, &value);
        JS_FreeValue(ctx, call_result);
        JS_FreeValue(ctx, value);
        JS_FreeValue(ctx, play_games_promise_resolve);
        play_games_promise_resolve = JS_UNDEFINED;
    }
}

static void shutdown_bridge(JSContext *ctx)
{
    SDL_SetAtomicInt(&reward_result, 0);
    JS_FreeValue(ctx, reward_promise_resolve);
    reward_promise_resolve = JS_UNDEFINED;
    JS_FreeValue(ctx, play_games_promise_resolve);
    play_games_promise_resolve = JS_UNDEFINED;
    if (play_games_mutex) {
        SDL_LockMutex(play_games_mutex);
        SDL_free(play_games_auth_code);
        play_games_auth_code = NULL;
        SDL_UnlockMutex(play_games_mutex);
    }
}

#ifdef __ANDROID__
JNIEXPORT void JNICALL Java_com_safex_snake_MainActivity_nativeOnRewardedAdResult(
    JNIEnv *env, jclass clazz, jboolean rewarded)
{
    (void)env;
    (void)clazz;
    SDL_SetAtomicInt(&reward_result, rewarded ? 1 : 2);
}

JNIEXPORT void JNICALL Java_com_safex_snake_MainActivity_nativeOnPlayGamesServerAuthCode(
    JNIEnv *env, jclass clazz, jstring auth_code)
{
    (void)clazz;
    const char *utf_chars = auth_code ? (*env)->GetStringUTFChars(env, auth_code, NULL) : NULL;
    if (play_games_mutex) SDL_LockMutex(play_games_mutex);
    SDL_free(play_games_auth_code);
    play_games_auth_code = utf_chars ? SDL_strdup(utf_chars) : NULL;
    if (play_games_mutex) SDL_UnlockMutex(play_games_mutex);
    if (utf_chars) (*env)->ReleaseStringUTFChars(env, auth_code, utf_chars);
    SDL_SetAtomicInt(&play_games_result, play_games_auth_code ? 1 : 2);
}
#endif

void admob_bridge_init(void)
{
    play_games_mutex = SDL_CreateMutex();
    const js_sdl3_module_extension extension = {
        .declare_exports = declare_exports,
        .set_exports = set_exports,
    };
    js_sdl3_set_module_extension(&extension);
    engine_set_js_bridge_callbacks(pump, shutdown_bridge);
}
