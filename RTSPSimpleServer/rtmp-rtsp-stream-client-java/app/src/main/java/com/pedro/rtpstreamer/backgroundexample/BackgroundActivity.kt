/*
 * Copyright (C) 2021 pedroSG94.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.pedro.rtpstreamer.backgroundexample

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.SurfaceHolder
import androidx.appcompat.app.AppCompatActivity
import com.pedro.rtpstreamer.R
import kotlinx.android.synthetic.main.activity_background.*

class BackgroundActivity : AppCompatActivity(), SurfaceHolder.Callback {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_background)
    RtpService.init(this)
    b_start_stop.setOnClickListener {
      if (isMyServiceRunning(RtpService::class.java)) {
        stopService(Intent(applicationContext, RtpService::class.java))
        b_start_stop.setText(R.string.start_button)
      } else {
        val intent = Intent(applicationContext, RtpService::class.java)
        intent.putExtra("endpoint", et_rtp_url.text.toString())
        startService(intent)
        b_start_stop.setText(R.string.stop_button)
      }
    }
    surfaceView.holder.addCallback(this)
  }

  override fun surfaceChanged(holder: SurfaceHolder, p1: Int, p2: Int, p3: Int) {
    RtpService.setView(surfaceView)
    RtpService.startPreview()
  }

  override fun surfaceDestroyed(holder: SurfaceHolder) {
    RtpService.setView(applicationContext)
    RtpService.stopPreview()
  }

  override fun surfaceCreated(holder: SurfaceHolder) {

  }

  override fun onResume() {
    super.onResume()
    if (isMyServiceRunning(RtpService::class.java)) {
      b_start_stop.setText(R.string.stop_button)
    } else {
      b_start_stop.setText(R.string.start_button)
    }
  }

  @Suppress("DEPRECATION")
  private fun isMyServiceRunning(serviceClass: Class<*>): Boolean {
    val manager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    for (service in manager.getRunningServices(Integer.MAX_VALUE)) {
      if (serviceClass.name == service.service.className) {
        return true
      }
    }
    return false
  }
}
