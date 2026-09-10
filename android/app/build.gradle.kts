plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.scamshield.quickscan"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.scamshield.quickscan"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Production backend endpoint by default (https://scamshield-udqs.onrender.com)
        // Can be overridden via project property or environment variable SCAMSHIELD_API_BASE_URL
        val configuredBaseUrl = project.findProperty("SCAMSHIELD_API_BASE_URL") as? String 
            ?: System.getenv("SCAMSHIELD_API_BASE_URL") 
            ?: "https://scamshield-udqs.onrender.com"

        val configuredWebUrl = project.findProperty("SCAMSHIELD_WEB_BASE_URL") as? String
            ?: System.getenv("SCAMSHIELD_WEB_BASE_URL")
            ?: "https://scamshield-mocha.vercel.app"

        buildConfigField("String", "DEFAULT_API_BASE_URL", "\"$configuredBaseUrl\"")
        buildConfigField("String", "DEFAULT_WEB_BASE_URL", "\"$configuredWebUrl\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.cardview:cardview:1.0.0")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

    // HTTP Networking & JSON
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")

    // Fast, local, private QR code decoding
    implementation("com.google.zxing:core:3.5.3")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
