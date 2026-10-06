package com.safex.snake;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.gamessignin.AuthResponse;

import java.util.Collections;

import org.libsdl.app.SDLActivity;

public final class MainActivity extends SDLActivity {
    private RewardedAd rewardedAd;
    private boolean showingRewardedAd;
    private boolean rewardEarned;
    private boolean waitingForRewardedAd;
    private boolean loadingRewardedAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Play Games Services v2 signs the player in automatically after SDK initialization.
        PlayGamesSdk.initialize(this);
        super.onCreate(savedInstanceState);
        MobileAds.initialize(this, initializationStatus -> loadRewardedAd());
        hideStatusBar();
    }

    public void showRewardedAd() {
        runOnUiThread(() -> {
            if (showingRewardedAd || waitingForRewardedAd) {
                nativeOnRewardedAdResult(false);
                return;
            }

            waitingForRewardedAd = true;
            if (rewardedAd == null) {
                loadRewardedAd();
                return;
            }
            showLoadedRewardedAd();
        });
    }

    private void showLoadedRewardedAd() {
        RewardedAd ad = rewardedAd;
        if (ad == null) return;

        rewardedAd = null;
        waitingForRewardedAd = false;
        showingRewardedAd = true;
        rewardEarned = false;
        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdDismissedFullScreenContent() {
                finishRewardedAd(rewardEarned);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(AdError adError) {
                finishRewardedAd(false);
            }
        });
        ad.show(this, rewardItem -> rewardEarned = true);
    }

    public void requestPlayGamesServerAuthCode() {
        runOnUiThread(() -> {
            String serverClientId = getString(R.string.google_play_games_server_client_id);
            if (serverClientId.isEmpty()) {
                nativeOnPlayGamesServerAuthCode(null);
                return;
            }

            PlayGames.getGamesSignInClient(this)
                .requestServerSideAccess(serverClientId, false, Collections.emptyList())
                .addOnCompleteListener(task -> {
                    AuthResponse response = task.isSuccessful() ? task.getResult() : null;
                    nativeOnPlayGamesServerAuthCode(
                        response == null ? null : response.getAuthCode()
                    );
                });
        });
    }

    private void loadRewardedAd() {
        if (rewardedAd != null || showingRewardedAd || loadingRewardedAd) return;
        loadingRewardedAd = true;
        RewardedAd.load(
            this,
            getString(R.string.admob_rewarded_ad_unit_id),
            new AdRequest.Builder().build(),
            new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(RewardedAd ad) {
                    loadingRewardedAd = false;
                    rewardedAd = ad;
                    if (waitingForRewardedAd) showLoadedRewardedAd();
                }

                @Override
                public void onAdFailedToLoad(LoadAdError adError) {
                    loadingRewardedAd = false;
                    if (waitingForRewardedAd) {
                        waitingForRewardedAd = false;
                        nativeOnRewardedAdResult(false);
                    }
                }
            }
        );
    }

    private void finishRewardedAd(boolean rewarded) {
        showingRewardedAd = false;
        nativeOnRewardedAdResult(rewarded);
        loadRewardedAd();
    }

    private static native void nativeOnRewardedAdResult(boolean rewarded);
    private static native void nativeOnPlayGamesServerAuthCode(String authCode);

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideStatusBar();
        }
    }

    private void hideStatusBar() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            );
        }
    }
}
